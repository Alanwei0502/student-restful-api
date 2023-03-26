/**
 * [jsDoc備註寫法] 
 * 取代 NewData Class 的函數
 * @param {object} body - request body 
 * @returns {object} new obejct
 */
function createNewObject(body){
  let newObject = {};

  for(let curKey in body){
    const curValue = body[curKey];

    if (curKey !== 'merit' && curKey !== 'other') {
      newObject[curKey] = curValue;
    } else {
      newObject[`scholarship.${curKey}`] = curValue;
    }
  }

  return newObject;
}

module.exports = createNewObject;