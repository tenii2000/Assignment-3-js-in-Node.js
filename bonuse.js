function majorityElement(arr) {
 

  
  for (let i = 0; i < arr.length; i++) {
    let count = 0; 

   
    for (let j = 0; j < arr.length; j++) {
      if (arr[j] === arr[i]) {
        count++;
      }
    }

   
    if (count > Math.floor(arr.length / 2)) {
      return arr[i]; 
    }
  }
  return -1;
}

const data = [3, 5, 8, 5, 4, 5, 7, 5, 5];
const result = majorityElement(data);
console.log("The majority element in the array is:", result);