/**
 * ATTENTION
 * Toutes les fonctions du controlleur modifient les listes passées en paramètre
 */
export default {
  moveItemTovalidList(
    automateItemList,
    profileItemList,
    automateItemSelected,
    profilItemSelected,
    validList
  ) {
    let automateIndice = automateItemList.findIndex(
      (el) => el.id === automateItemSelected
    );

    if (automateIndice == -1) return;

    let profileIndice = profileItemList.findIndex(
      (el) => el.id === profilItemSelected
    );

    if (profileIndice == -1) return;

    let automateItemFound = automateItemList[automateIndice];
    let profileItemFound = profileItemList[profileIndice];

    if (automateItemFound && profileItemFound) {
      validList = [
        {
          automateItem: automateItemFound,
          profileItem: profileItemFound,
        },
        ...validList,
      ];

      profileItemList.splice(automateIndice, 1);
      automateItemList.splice(profileIndice, 1);
      return validList;
    }
  },

  removeItemItemFromValidList(
    validList,
    invalidAutomateItems,
    invalidProfileItems,
    automateItemId,
    profileItemId
  ) {
    let indice = validList.findIndex(
      (item) =>
        item.automateItem.id === automateItemId &&
        item.profileItem.id === profileItemId
    );

    if (indice == -1) return;

    const found = validList[indice];

    if (found) {
      invalidAutomateItems = [found.automateItem, ...invalidAutomateItems];
      invalidProfileItems = [found.profileItem, ...invalidProfileItems];

      validList.splice(indice, 1);
    }
  },
};
