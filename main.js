const Discord = require('discord.js');
const { Client, Intents } = require('discord.js');
const fs = require('fs');
const client = new Client({ 
    intents: [
        Intents.FLAGS.GUILDS, 
        Intents.FLAGS.GUILD_MESSAGES, 
        Intents.FLAGS.GUILD_MEMBERS, 
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ] 
});

const token = 'MTE5MTQwMTI5NzY1MjQ5MDMyMA.G96ysD.UACY_ieS_bysE4xsj-g467FPp9U4QDkabsj9Rw';
const compteur = require('./compteur');
const roleToBanMembers = 'Nom_du_Role_Autorisé'; // Remplace par le nom du rôle autorisé à utiliser la commande

// https://discord.com/oauth2/authorize?client_id=1191401297652490320&scope=bot&permissions=8
// Lien pour ajouter le bot sur un serveur


client.on('ready', () => {
    console.log(`Connecté en tant que ${client.user.tag}!`);
});

client.on('message', async (message) => {
    if (message.author.bot) return; // Ignorer les messages des autres bots
    if (!message.guild) return; // S'assurer que le message provient d'un serveur

    const args = message.content.split(' ');
    const command = args[0].toLowerCase();

    if (command === '!ban') {
        // Vérifier si l'utilisateur a le rôle autorisé
        if (!message.member.roles.cache.some(role => role.name === roleToBanMembers)) {
            return message.reply('Tu n as pas le role pour utiliser cette commande.');
        }

        // Vérifier si un utilisateur est mentionné
        const userToBan = message.mentions.users.first();
        if (!userToBan) {
            return message.reply('Mentionne l utilisateur que tu veux bannir.');
        }

        // Récupérer le membre correspondant à l'utilisateur mentionné
        const memberToBan = message.guild.members.cache.get(userToBan.id);

        // Vérifier si le membre peut être banni
        if (!memberToBan.bannable) {
            return message.reply('Je ne peux pas bannir cet utilisateur.');
        }

        // Bannir l'utilisateur
        await memberToBan.ban();

        // Envoyer un message de confirmation
        message.channel.send(`${userToBan.tag} a été banni du serveur.`);

         // Mise à jour du compteur pour l'utilisateur
        compteur.updateMessageCount(message.author.id);

        // Vérification de la commande pour obtenir le nombre de messages de l'utilisateur
        if (message.content.toLowerCase() === '!mynummessages') {
            const userMessageCount = compteur.getMessageCount(message.author.id);
            message.reply(`Tu as envoyé ${userMessageCount} messages.`);
        }

        // Commande pour obtenir le nombre de messages d'un autre utilisateur
        if (message.content.toLowerCase().startsWith('!nummessages')) {
            // Extrait le nom d'utilisateur mentionné dans la commande
            const mentionedUser = message.mentions.users.first();
        
            if (!mentionedUser) {
                return message.reply('Mentionne un utilisateur pour obtenir le nombre de messages.');
            }

            const mentionedUserMessageCount = compteur.getMessageCount(mentionedUser.id);
            message.channel.send(`${mentionedUser.tag} a envoyé ${mentionedUserMessageCount} messages.`);
        }

        // Commande pour générer un fichier texte avec le nombre de messages de tous les utilisateurs
        if (message.content.toLowerCase() === '!exportmessages') {
            const userMessageCounts = [];

            // Parcours tous les membres du serveur
            message.guild.members.cache.forEach((member) => {
                const userMessageCount = compteur.getMessageCount(member.user.id);
                userMessageCounts.push(`${member.user.tag} => ${userMessageCount} messages`);
            });

            // Génère le contenu du fichier texte
            const fileContent = userMessageCounts.join('\n');

            // Écrit le contenu dans un fichier texte
            fs.writeFile('user_messages.txt', fileContent, (err) => {
                if (err) throw err;
                console.log('Fichier user_messages.txt généré avec succès!');
                message.reply('Fichier user_messages.txt généré avec succès!');
            });
        }
    }
});

client.login(token);
