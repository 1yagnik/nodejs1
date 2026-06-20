const productlist = [
    {name:'sues', price:50, quantity:2},
    {name:'bag', price:25,quantity:1}
]

function mathproduct(product){
    total = 0;
    product.forEach(product => {
        total += product.quantity * product.quantity
    });
    return total
}

const grandtotal = mathproduct(productlist)

console.log(grandtotal)

