const express = require("express");

const router = express.Router();

const checkJWT = require("../middlewares/checkJWT");
const boCheckJWT = require("../middlewares/bo-check-JWT");

const demandeSejourController = require("../controllers/demandeSejour");
const getDepartements = require("../middlewares/getDepartements");

// Gère une connexion via mot de passe.
router.get(
  "/admin",
  boCheckJWT,
  getDepartements,
  demandeSejourController.getByDepartementCodes,
);
router.get(
  "/admin/:id",
  boCheckJWT,
  getDepartements,
  demandeSejourController.getByIdBo,
);
router.get(
  "/admin/historique/:id",
  boCheckJWT,
  demandeSejourController.historique,
);
router.get("/:id", checkJWT, demandeSejourController.getById);
router.get("/historique/:id", checkJWT, demandeSejourController.historique);

router.get("/", checkJWT, demandeSejourController.get);
router.post("/depose/:id", checkJWT, demandeSejourController.depose);
router.post("/:id", checkJWT, demandeSejourController.update);
router.post("/", checkJWT, demandeSejourController.post);

module.exports = router;
