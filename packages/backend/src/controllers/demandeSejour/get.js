const DemandeSejour = require("../../services/DemandeSejour");

const logger = require("../../utils/logger");

const log = logger(module.filename);

module.exports = async function get(req, res, next) {
  log.i("IN");
  const { decoded } = req;
  const { id: userId } = decoded;
  log.d("userId", { userId });

  try {
    const demandes = await DemandeSejour.get(userId);
    log.d(demandes);
    return res.status(200).json({ demandes });
  } catch (error) {
    log.w("DONE with error");
    return next(error);
  }
};
