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