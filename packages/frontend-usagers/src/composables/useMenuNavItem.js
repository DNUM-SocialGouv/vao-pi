import { useUserStore, useOrganismeStore, computed } from "#imports";

export const useMenuNavItems = () => {
  const userStore = useUserStore();
  const organismeStore = useOrganismeStore();
  return computed(() => {
    if (!userStore.isConnected) {
      return [];
    }

    return [
      {
        text: "Accueil",
        to: "/",
      },
      {
        title: "Organisateur",
        links: [
          {
            text: "Ma fiche organisateur",
            to: "/organisme",
          },
        ],
      },
      ...(organismeStore.organismeCourant?.complet
        ? [
            {
              title: "Déclaration de séjour",
              links: [
                {
                  text: "Nouvelle déclaration",
                  to: "/demande-sejour",
                },
                {
                  text: "Mes déclarations",
                  to: "/demande-sejour/liste",
                },
              ],
            },
          ]
        : []),
      {
        text: "Mes hébergements",
        to: "/hebergements/liste",
      },
    ];
  });
};
