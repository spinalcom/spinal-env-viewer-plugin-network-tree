
import dedent from "dedent";

export default dedent`
   /**
   *   1 - Don't change the function name and parameters
   *   2 - This function must return a boolean
   *   3 - Change function content to match with your test
   *   4 - All your code must be inside the function
   */

   function elementIsControlled(automateAttrValue, elementAttrValue) {
      const automateAttrValueSplited = automateAttrValue.split("-");
      const elementAttrValueSplited = elementAttrValue.split("-");
      const aut_substr = automateAttrValueSplited[0] + "-" + automateAttrValueSplited[1] + "-" + automateAttrValueSplited[automateAttrValueSplited.length - 1];
      const elm_substr = elementAttrValueSplited[0] + "-" + elementAttrValueSplited[1] + "-" + elementAttrValueSplited[elementAttrValueSplited.length - 1];


      const substr = aut_substr.toString().replace(/.$/,'');
      const regex = new RegExp(substr + '[1-9]$');

      return elm_substr.toString().match(regex) ? true : false
   }`




/*
`
   function elementIsControlled(automateAttrValue, elementAttrValue) {

      const automateSubstr = automateAttrValue.substring(0, automateAttrValue.length);
      const elementSubstr = elementAttrValue.substring(0, elementAttrValue.length);

      if(automateSubstr === elementSubstr) {
         const autEnd = automateAttrValue[automateAttrValue.length];
         const elementEnd = elementAttrValue[elementAttrValue.length];

         return  elementEnd > autEnd
      }

      return false
   }
`

*/