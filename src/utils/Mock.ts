export function mock( message: String ): String{
    for (let i = 0; i < message.length; i++){
        if(i%(Math.round(Math.random()*4)) == 0){
          message = message.substr(0, i) + (message[i].toUpperCase()) + message.substr(i + 1);
        }else{
          message = message.substr(0, i) + (message[i].toLowerCase()) + message.substr(i + 1);
        }
    }
    return message;
}