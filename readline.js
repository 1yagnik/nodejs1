const { create } = require('domain')
const readline = require('readline')

const interface = readline.createInterface({
    input : process.stdout,
    output : process.stdin
})


interface.question('Enter First Number', (num1) =>{
    interface.question('Enter Second Number', (num2) =>{
        const sum = Number(num1) + Number(num2)
        console.log(sum)
        if(num1 > num2){
            console.log(num1)
        }else{
            console.log(num2)
        }
    })
})