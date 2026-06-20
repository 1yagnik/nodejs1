const axios = require('axios');

const solution = async() =>{
    try{
        const response  = await axios.get('https://www.kaggle.com/datasets')
        const data = response.data;
        console.log(data)
    }catch (error){
        console.log('error')
    }
};

solution()