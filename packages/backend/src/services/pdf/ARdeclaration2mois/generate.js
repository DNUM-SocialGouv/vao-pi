/* eslint-disable no-param-reassign */
const logger = require("../../../utils/logger");
const build = require("./build");
const Document = require("../../Document");
const DemandeSejour = require("../../DemandeSejour");
const dayjs = require("dayjs");

const log = logger(module.filename);

const generate = async (declaration, idFonctionnelle, departementSuivi) => {
  log.i("IN");
  try {
    // générer document
    const buffer = await build(declaration ?? {}, departementSuivi);

    // insert into documents table
    const uuid = await Document.createFile(
      `AR_${idFonctionnelle}.pdf`,
      "AR_declaration_2_mois",
      "application/pdf",
      buffer,
    );
    log.d(`http://localhost:3010/documents/${uuid}`);

    // insert into demande_sejour table
    if (declaration.files === null || declaration.files === undefined) {
      declaration.files = { files: [] };
    } else if (
      declaration.files.files === null ||
      declaration.files?.files === undefined
    ) {
      declaration.files.files = [];
    }
    const files = declaration.files.files;
    const fileToAdd = {
      createdAt: dayjs().format(),
      name: `AR_${idFonctionnelle}.pdf`,
      type: "AR_declaration_2_mois",
      uuid,
    };
    files.push(fileToAdd);
    await DemandeSejour.addFile(declaration.id, { files });
    return uuid;
  } catch (e) {
    log.w(e);
    return null;
  }
};

module.exports = generate;
