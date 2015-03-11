var generatePassword = function(){
    var names = ['Luke','Elaine','Steve','Jolyn','Lillian','Liping','Alex','Liana','Dean','Jenny','Kawin','Jane'];
    var prepositions = ['Is', 'Is_Always', 'Is_Never', 'Likes_To_Be','Wants_To_Be','Does_Not_Want_To_Be','Likes_Being','Does_Not_Like_Being','Is_Rarely'];
    var roles = ['Merlin', 'Mordred', 'Morgana', 'Percival', 'Lancelot', 'Oberon', 'Red', 'Blue', 'The_Assassin','Vanilla_Red','Vanilla_Blue','The_Leader','Fifth'];
    var random_name = names[Math.floor(Math.random()*names.length)];
    var random_preposition = prepositions[Math.floor(Math.random()*prepositions.length)];
    var random_role = roles[Math.floor(Math.random()*roles.length)];
    return random_name + "_" + random_preposition + "_" + random_role
};



module.exports = generatePassword;