const yup = require("yup");

const schema = ({ isFromAPIAdresse } = {}) => {
  return isFromAPIAdresse
    ? {
        codeInsee: yup.string().required("ce champ est obligatoire"),
        codePostal: yup.string().required("ce champ est obligatoire"),
        coordinates: yup.array().required("ce champ est obligatoire"),
        departement: yup.string().required("ce champ est obligatoire"),
        label: yup.string().required("ce champ est obligatoire"),
      }
    : {
        label: yup.string().required(),
      };
};

module.exports = schema;
