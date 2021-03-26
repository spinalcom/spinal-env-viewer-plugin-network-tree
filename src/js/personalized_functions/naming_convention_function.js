import dedent from 'dedent';

export default dedent`
   /**
   *   1 - Don't change the function name and parameters
   *   2 - This function must return a String (the naming convention)
   *   3 - Change function content to match with your test
   *   4 - All your code must be inside the function
   */

   function getNamingConvention(attributeValue) {
      const attributeSplitted = attributeValue.split('-');
      const before = attributeSplitted[attributeSplitted.length - 2];
      const last = attributeSplitted[attributeSplitted.length - 1];

      if(before && last) return before + "_" + last[last.length - 1];

      return attributeValue
   }

`