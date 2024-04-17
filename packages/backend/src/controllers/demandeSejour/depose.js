const dayjs = require("dayjs");
const yup = require("yup");

const DemandeSejour = require("../../services/DemandeSejour");
const Hebergement = require("../../services/Hebergement");
const Send = require("../../services/mail").mailService.send;
const PdfDeclaration2Mois = require("../../services/pdf/declaration2mois/generate");
const PdfARDeclaration2Mois = require("../../services/pdf/ARdeclaration2mois/generate");

const DeclarationSejourSchema = require("../../schemas/declaration-sejour");

const MailUtils = require("../../utils/mail");
const logger = require("../../utils/logger");
const ValidationAppError = require("../../utils/validation-error");
const { statuts } = require("../../helpers/ds-statuts");
const AppError = require("../../utils/error");

const log = logger(module.filename);

const expectedStates = [statuts.BROUILLON, statuts.A_MODIFIER];

module.exports = async function post(req, res, next) {
  const demandeSejourId = req.params.id;
  const { id: userId } = req.decoded;
  const { attestation } = req.body;
  log.i("IN", { demandeSejourId });

  if (!demandeSejourId) {
    log.w("missing parameter");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  if (!attestation) {
    log.w("DONE with error");
    return next(
      new AppError("Paramètre incorrect", {
        statusCode: 400,
      }),
    );
  }

  let declaration, DSuuid, ARuuid;

  declaration = await DemandeSejour.getOne({ "ds.id": demandeSejourId });

  if (!declaration) {
    log.w("DONE with error");
    return next(
      new AppError("Déclaration non trouvée", {
        statusCode: 404,
      }),
    );
  }

  const { dateDebut, dateFin, statut } = declaration;

  if (!expectedStates.includes(statut)) {
    log.w("Unexpected states", { expectedStates, statut });
    return next(
      new AppError("Statut incomptabile", {
        statusCode: 400,
      }),
    );
  }

  Object.assign(declaration, { attestation });

  try {
    log.d("finalize - before validation", { declaration });
    declaration = await yup
      .object(DeclarationSejourSchema(dateDebut, dateFin))
      .validate(declaration, {
        abortEarly: false,
        stripUnknown: true,
      });

    log.d("finalize - after validation", { declaration });

    declaration.attestation.at = dayjs(declaration.attestation.at).format(
      "YYYY-MM-DD",
    );
    declaration.dateDebut = dayjs(declaration.dateDebut).format("YYYY-MM-DD");
    declaration.dateFin = dayjs(declaration.dateFin).format("YYYY-MM-DD");
  } catch (error) {
    return next(new ValidationAppError(error));
  }

  const firstHebergementId =
    declaration.hebergement.hebergements[0].hebergementId;

  const hebergement = await Hebergement.getOne({ id: firstHebergementId });
  if (!hebergement) {
    log.w("DONE with error");
    return next(
      new AppError("Hébergement non trouvé", {
        statusCode: 404,
      }),
    );
  }
  const departementSuivi = hebergement.coordonnees.adresse.departement;

  const numSeq = await DemandeSejour.getNextIndex();

  const currentYear = dayjs(declaration.dateDebut).format("YY");
  const idFonctionnelle = `DS-${currentYear}-${departementSuivi}-${numSeq.padStart(4, "0")}`;

  await DemandeSejour.finalize(
    demandeSejourId,
    departementSuivi,
    idFonctionnelle,
    declaration,
  );

  declaration = await DemandeSejour.getOne({ "ds.id": demandeSejourId });

  await DemandeSejour.insertEvent(
    "Organisateur",
    demandeSejourId,
    userId,
    null,
    "declaration_sejour",
    statut === statuts.BROUILLON ? "Dépôt DS à 2 mois" : "Ajout de compléments",
    declaration,
  );

  try {
    const destinataires = await DemandeSejour.getEmailToList(
      declaration.organismeId,
    );
    const cc = await DemandeSejour.getEmailCcList(
      declaration.organisme.personneMorale.siren ?? "personnePhysique",
    );

    const filteredCc = cc.filter((d) => !destinataires.includes(d));
    if (destinataires) {
      await Send(
        MailUtils.usagers.declarationSejour.sendAR2mois({
          cc: filteredCc,
          declaration,
          dest: destinataires,
        }),
      );
    }
  } catch (error) {
    log.w("DONE with error");
    return next(
      new AppError("Une erreur est survenue lors de l'envoi de mails", {
        statusCode: 500,
      }),
    );
  }
  try {
    const destinatairesBack =
      await DemandeSejour.getEmailBack(departementSuivi);

    if (destinatairesBack) {
      const departements = declaration.hebergement.hebergements.map(
        (h) => h.coordonnees.adresse.departement,
      );
      const destinatairesBackCc =
        await DemandeSejour.getEmailBackCc(departements);

      const filteredBackCc = destinatairesBackCc.filter(
        (d) => !destinatairesBack.includes(d),
      );
      await Send(
        MailUtils.bo.declarationSejour.sendDeclarationNotify({
          cc: filteredBackCc,
          departementSuivi,
          departementsSecondaires: departements.filter(
            (d) => d !== departementSuivi,
          ),
          destinataires: destinatairesBack,
          id: declaration.idFonctionnelle,
        }),
      );
    }
  } catch (error) {
    log.w(error);
    return next(
      new AppError(
        "Une erreur est survenue lors de l'envoi de mails aux usagers back office",
        {
          statusCode: 500,
        },
      ),
    );
  }

  try {
    DSuuid = await PdfDeclaration2Mois(
      declaration,
      idFonctionnelle,
      departementSuivi,
    );
  } catch (error) {
    log.w(error);
  }
  try {
    ARuuid = await PdfARDeclaration2Mois(
      declaration,
      idFonctionnelle,
      departementSuivi,
    );
  } catch (err) {
    log.w(err);
  }
  log.w("DONE");
  return res.status(200).json({ ARuuid, DSuuid });
};
