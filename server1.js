const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http); //create a new instance of socket.io
const Game = require('./class_game2.js').Game2; //importation de la classe Game

//déclaration des variables essentielles
var game = new Game(undefined,undefined);
var started = false;

//partie routage middleware
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/pageweb1.html');
});
app.get('/images/:image', function(req,res){
  switch (req.params.image) {
    case 'black':
      res.sendFile(__dirname + '/images/black.png');
      break
    case 'gray':
      res.sendFile(__dirname + '/images/gray.png');
      break
    case 'me1':
      res.sendFile(__dirname + '/images/me1.png');
      break
    case 'you1':
      res.sendFile(__dirname + '/images/you1.png');
      break
    case 'meD1':
      res.sendFile(__dirname + '/images/meD1.png');
      break
    case 'youD1':
      res.sendFile(__dirname + '/images/youD1.png');
      break;
  }
});
app.get('/data', (req,res) => {
  res.send(game.data_game);
});

//partie socket
io.on('connection', (socket) => {
  //listen on the connection event
  console.log(socket.id + ' connected');
  //attribution des joueur lors de la connection
  if (game.player1 == undefined) {
    game.player1 = socket.id;
    io.emit('chat message', '[info]: Joueur 1 connecté');
  }
  else {
    if (game.player2 == undefined) {
      game.player2 = socket.id;
      io.emit('chat message', '[info]: Joueur 2 connecté');
    }
    else {console.log('Trop de joueurs en ligne')}
  };

  //récupération des données du jeu
  socket.on('data', () => {
    socket.emit('data',game.data_game);
  });

  //gestion du démarrage de la partie
  socket.on('start', () => {
    //permet à la partie de commencer si les deux joueurs sont prêts
    //mieux que /start
    console.log(socket.id + " ready");
    switch (socket.id) {
        case game.player1:
          game.readyPlayer1 = true;
          break
        case game.player2:
          game.readyPlayer2 = true;
      }

    //test pour démarrage de la partie
    if (game.status != 'started') {
      console.log(game.status);
      if (game.readyPlayer1 && game.readyPlayer2) {
        if (game.status == 'interrupted') {
          game.status = 'started';
          io.emit('chat message', 'La partie recommence !');
        }
        if (game.status == 'stoped') {
          game.status = 'started';
          io.emit('chat message', 'La partie commence !');
          io.emit('chat message', 'Le Joueur 1 commence');
        }
      }
    }
  });

  socket.on('pass', () => {
    //permet aux joueurs de passer leur tour
    if (game.status == 'started') {
      if (game.turn == game.getPlayer(socket.id)) {
        switch (socket.id) {
          case game.player1:
            game.turn = 'player2';
            game.blows = [];
            io.to(game.player1).emit('chat message','Tour passé');
            io.to(game.player2).emit('chat message','A votre tour de jouer !');
            break
          case game.player2:
            game.turn = 'player1';
            game.blows = [];
            io.to(game.player2).emit('chat message','Tour passé');
            io.to(game.player1).emit('chat message','A votre tour de jouer !');
        }
      }
    }
    else {
      switch (socket.id) {
        case game.player1:
          if (game.status == 'interrupted') {
            socket.emit('chat message','En attente du Joueur 2 déconnecté ...')
          }
        case game.player2:
          if (game.status == 'interrupted') {
            socket.emit('chat message','En attente du Joueur 1 déconnecté ...')
          }
      }
    }
  });


  socket.on('chat message', (msg) => {
    //écrit dans le chat pour tout le monde
    switch (socket.id) {
        case game.player1:
          io.emit('chat message', 'Joueur 1 : ' + msg);
          break
        case game.player2:
          io.emit('chat message', 'Joueur 2 : ' + msg);
    };
  });

  socket.on('move', (data) => { //on reçoit data de la forme {'i1': i1, 'j1': j1, 'i2': i2, 'j2': j2 } (1 vers 2)
    //réception des données du move
    if (game.status == 'started') {
      if (game.player1 == undefined || game.player2 == undefined) {
        //un joueur est déconnecté
        switch (socket.id) {
          case game.player1 :
            socket.emit('chat message','En attente du Joueur 2 ...')
            break
          case game.player2 :
            socket.emit('chat message','En attente du Joueur 1 ...')
        }
      }
      else {
        // les joueur sont tous deux connectés
        if (game.getPlayer(socket.id) == game.turn) {
        //résultat du move
        if (game.blows.length == 0) {
          //aucun coup stacké
          result = game.move(socket.id, data.i1, data.j1, data.i2, data.j2);
          if (result) {
            sended_data = {...data,...result};
            io.emit('move', sended_data);
            io.emit('chat message', "Action effectuée");
            if (result.win != undefined) {
              switch (result.win) {
                case 'player1':
                  io.emit('chat message','Partie terminée, le Joueur 1 a gagné :)')
                  break
                case 'player2':
                  io.emit('chat message','Partie terminée, le Joueur 2 a gagné :)')
              }
            }
            //gestion des coups multiples
            if (result.issue == 'eaten') {
              game.blows.push({'i':data.i1, 'j':data.j1});
              game.blows.push({'i':data.i2, 'j':data.j2});
            }
            else {
              switch (socket.id) {
                case game.player1:
                  game.turn = 'player2';
                  io.to(game.player2).emit('chat message','A votre tour de jouer !');
                  break
                case game.player2:
                  game.turn = 'player1';
                  io.to(game.player1).emit('chat message','A votre tour de jouer !');
                  break
              }
            }
          }
          else {
          socket.emit('chat message', "Action impossible");
          }
        }
        else {
          //il y a des coups stackés
          var n = game.blows.length;
          if (data.i1 == game.blows[n-1].i && data.j1 == game.blows[n-1].j) {
            //manque le fait de ne pas revenir sur une case déjà visitée
            //le dernier pion est bien réutilisé
            //faire fonction test
            if (game.validMoveEating(socket.id,data.i1, data.j1, data.i2, data.j2)) {
              //le coup est vérifié
              result = game.move(socket.id, data.i1, data.j1, data.i2, data.j2);
              if (result) { //seconde vérification
                sended_data = {...data,...result};
                io.emit('move', sended_data);
                io.emit('chat message', "Action effectuée");
                game.blows.push({'i':data.i2, 'j':data.j2});
                if (result.win != undefined) {
                  switch (result.win) {
                    case 'player1':
                      io.emit('chat message','Partie terminée, le Joueur 1 a gagné :)')
                      break
                    case 'player2':
                      io.emit('chat message','Partie terminée, le Joueur 2 a gagné :)')
                  }
                }
              }
            }
          }
        }
      }
      else {
        socket.emit('chat message', "Ce n'est pas à votre tour de jouer");
      }
      }
    }
    else {
      if (game.status == 'interrupted') {
        socket.emit('chat message', "Action impossible, partie interrompue ...");
      }
      else {
        socket.emit('chat message', "Action impossible, partie non commencée");
      }
    }
  });

  //désattribution des joueurs lors de la déconnection
  socket.on('disconnect', () => {
    console.log(socket.id + ' disconnected');
    switch (socket.id) {
      case game.player1:
        game.player1 = undefined;
        io.emit('chat message', '[info]: Joueur 1 déconnecté');
        if (game.status != 'stoped') {
          game.status = 'interrupted'
        }
        game.readyPlayer1 = false;
        break
      case game.player2:
        game.player2 = undefined;
        io.emit('chat message', '[info]: Joueur 2 déconnecté');
        if (game.status != 'stoped') {
          game.status = 'interrupted'
        }
        game.readyPlayer2 = false;
        break
    }
  });
});


//partie listen
http.listen(3000, () => {
  console.log('listening on *:3000');
});