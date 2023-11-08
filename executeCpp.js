const {exec}  = require('child_process');
const fs = require('fs');
const path = require('path');
const outputPath = path.join(__dirname,"outputs");

if(!fs.existsSync(outputPath)){
    fs.mkdirSync(outputPath,{recursive:true});
}

const executeCpp = async({language,code ,input,inputRadio}) =>{
console.log("from execute : ",language)
console.log("from execute : ",code)
console.log("from execute : ",input)
console.log("from execute : ",inputRadio)



}
module.exports = {
    executeCpp

};
// exec(`gcc ${filepath} -o ${outPath} && cd ${outputPath} &&  ${outPath} `,

// //    exec (`g++ ${filepath} -o ${outPath} && cd ${outputPath} && ./${jobId}.out`,
//    (error, stdout, stderr)=>{
//     error && reject({error,stderr});
//     console.log(error);
//     stderr && reject(stderr);
//     console.log(stderr);
//     resolve(stdout);
//     console.log(stdout);
   
//    });
