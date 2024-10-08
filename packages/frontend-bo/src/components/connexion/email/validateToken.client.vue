<template>
  <div class="fr-container">
    <p v-if="pending">Validation en cours. Veuillez patienter.</p>
    <div v-else-if="error">
      <DsfrAlert
        role="alert"
        class="fr-grid-row fr-my-3v"
        title="Erreur lors de la validation du compte"
        :description="helpers[classError]"
        type="error"
        :closeable="false"
      />
      <DsfrButton
        v-if="classError === 'TokenExpiredError'"
        class="fr-grid-row fr-grid-row--center fr-my-5v"
        @click.prevent="renewToken"
        >Générer un nouveau lien
      </DsfrButton>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({ token: { type: String, required: true } });
const log = logger("components/connexion/email/validationToken");

const toaster = useToaster();

const config = useRuntimeConfig();

const classError = ref("");
const helpers = {
  TokenExpiredError:
    "Le lien utilisé est déjà expiré. Cliquer sur le bouton « Générer un nouveau lien »",
  UserAlreadyVerified:
    "Votre adresse courriel semble déjà activé. Rendez-vous sur la page de connexion pour vous identifier.",
};
const { data, error, pending } = useFetchBackend(
  "/bo-authentication/email/validate",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: { token: props.token },

    onResponseError({ response }) {
      if (response._data?.name) {
        const codeError = response._data.name;
        log.w({ codeError });
        classError.value = codeError;
      }
    },
  },
);

watch(data, () => {
  if (data.value == null) {
    return;
  }
  toaster.success({
    titleTag: "h2",
    description: `Votre compte est maintenant activé. Vous allez être redirigé vers la page de modification du mot de passe.`,
  });

  //props.token
  //xxxxxxxxxxxxxxxxxxxxxxxxx
  return navigateTo("/connexion/reset-mot-de-passe?token=" + props.token);
});

function parseJwt(token) {
  const base64Url = token.split(".")[1];
  const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join(""),
  );

  return JSON.parse(jsonPayload);
}

async function renewToken() {
  log.i("renew - IN");
  const decoded = parseJwt(props.token);
  await $fetch(
    config.public.backendUrl + "/bo-authentication/email/renew-token",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email: decoded.email }),
    },
  )
    .then(() => {
      toaster.success({
        titleTag: "h2",
        description: `Un nouvel courriel de validation a été envoyé sur votre boîte de courriel.`,
      });

      log.i("renew - Done");
    })
    .catch((error) => {
      toaster.error({
        titleTag: "h2",
        description: `Une erreur est survenue lors de l'envoi du courriel. Veuillez contacter l'assistance.`,
      });
      log.w("renew", error);
    });
}
</script>

<style lang="scss" scoped></style>
