let ans = Number(prompt("Enter your age: "));
if(isNaN(ans)){
    console.log("Please enter a valid number.");
}
else if(ans >= 18){
    console.log("You are eligible to vote.");
} else {
    console.log("You are not eligible to vote.");
}