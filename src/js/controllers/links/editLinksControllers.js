/**
 * ATTENTION
 * Toutes les fonctions du controlleur modifient les listes passées en paramètre
 */
export default {
  moveItemTovalidList(automateItemList, profileItemList, automateItemSelected, profilItemSelected, validList) {
    let automateIndice = automateItemList.findIndex((el) => el.id === automateItemSelected);
    if (automateIndice == -1) return;

    let profileIndice = profileItemList.findIndex((el) => el.id === profilItemSelected);
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

      // commented to avoid deleting items from the list before saving the link
      // profileItemList.splice(profileIndice, 1);

      automateItemList.splice(automateIndice, 1);
      return validList;
    }
  },

  async removeItemFromValidList(validList, invalidAutomateItems, invalidProfileItems, automateItemId, profileItemId) {

    let indice = validList.findIndex((item) => item.automateItem.id === automateItemId && item.profileItem.id === profileItemId);

    if (indice != -1) {
      const found = validList[indice];
      if (found) {
        invalidAutomateItems = [found.automateItem, ...invalidAutomateItems];

        // commented because we already have the profile item in the list of profile items
        // invalidProfileItems = [found.profileItem, ...invalidProfileItems];

        validList = validList.filter((item) => item.automateItem.id != automateItemId && item.profileItem.id != profileItemId);
      }
    }

    return { invalidAutomateItems, invalidProfileItems, validList };
  },
};
