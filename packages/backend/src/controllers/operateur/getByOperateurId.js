const Operateur = require("../../services/Operateur");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res) {
  log.i("In");
  const operateurId = req.params.id;
  const { decoded } = req;
  const { id: userId } = decoded;
  if (!operateurId) {
    log.w("missing or invalid parameter");
    return res.status(400).json({ message: "paramètre manquant ou erroné." });
  }
  try {
    const operateur = await Operateur.get({
      id: operateurId,
      use_id: userId,
    });
    log.d(operateur);
    return res.status(200).json({ operateur });
  } catch (error) {
    log.w(error);
    return res.status(400).json({
      message: "une erreur est survenue durant la récupération de l'opérateur",
    });
  }
};
