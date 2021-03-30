class Game {
	constructor(player1, player2) {
		this.player1 = player1; //en bas
		this.player2 = player2; //en haut

		this.eaten1 = 0;
		this.eaten2 = 0;

		this.status = 'stoped';
		this.turn = 'player1';

		this.readyPlayer1 = false;
		this.readyPlayer2 = false;

		this.reloadPlayer1 = false;
		this.reloadPlayer2 = false;

		this.blows = [];

		this.data_game = [[-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
					 	[0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
					 	[-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
					 	[0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
					 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					 	[1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
					 	[0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
					 	[1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
					 	[0, 1, 0, 1, 0, 1, 0, 1, 0, 1]];

		};

	getPlayer(player) {
		switch (player) {
			case this.player1:
				return 'player1'
				break
			case this.player2:
				return 'player2'
		}
	}

	validSelection(player, pi, pj) {
		if (player == this.player1 && this.data_game[pi][pj] >= 1 || player == this.player2 && this.data_game[pi][pj] <= -1) {
			return true
		}
		else {
			console.log('[validSelection]: '+player+ ' '+pi, + ' '+pj+' case: '+this.data_game[pi][pj]);
			return false
		}
	}

	NbBetween(player, p1i, p1j, p2i, p2j) {
		switch (player) {
			case this.player1:
				var posList = [];
				var n = 0;
				var l = Math.abs(p2i-p1i);
				var di = (p2i-p1i)/l;
				var dj = (p2j-p1j)/l;
				var p0i = p1i;
				var p0j = p1j;
				while (n<l) {
					if (this.data_game[p0i][p0j] <= -1) {
						posList.push({'i': p0i, 'j': p0j});
						console.log('[NbBetween]: '+'finded');
					}
					n++;
					p0i += di;
					p0j += dj;
				};
				return posList;
				break;

			case this.player2:
				var posList = [];
				var n = 0;
				var l = Math.abs(p2i-p1i);
				var di = (p2i-p1i)/l;
				var dj = (p2j-p1j)/l;
				var p0i = p1i;
				var p0j = p1j;
				while (n<l) {
					if (this.data_game[p0i][p0j] >= 1) {
						posList.push({'i': p0i, 'j': p0j});
						console.log('[NbBetween]: '+'finded');
					}
					n++;
					p0i += di;
					p0j += dj;
				};
				return posList;
		}
	}

	getOtherPlayer(player) {
		switch (player) {
			case this.player1:
				return this.player2;
				break
			case this.player2:
				return this.player1;
		}
	}

	move(player,p1i,p1j,p2i,p2j) {
		if (this.validSelection(player, p1i, p1j)) {
			//sélection valide
			if (this.data_game[p2i][p2j] == 0) {
				//cible vide

				//cas joueur 1
				if (player == this.player1) {
					if (this.data_game[p1i][p1j] == 1) {
						//pion normal
						if (Math.abs(p2i - p1i) == 2 && Math.abs(p2j - p1j) == 2) {
							//coup attaque
							if (this.data_game[(p2i+p1i)/2][(p2j+p1j)/2] <= -1) {
								//présence d'un pion ennemi
								this.data_game[(p2i+p1i)/2][(p2j+p1j)/2] = 0;
								this.data_game[p1i][p1j] = 0;
								this.eaten1 += 1;
								if (p2i == 0) {
									//transformation en dame
									this.data_game[p2i][p2j] = 2;
									if (this.isWon(player)) {
										return {'player': 'player1', 'issue': 'eaten', 'transform': true, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece', 'win': 'player1'};
									}
									return {'player': 'player1', 'issue': 'eaten', 'transform': true, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece'};
								}
								else {
									//pas de transformation
									this.data_game[p2i][p2j] = 1;
									if (this.isWon(player)) {
										return {'player': 'player1', 'issue': 'eaten', 'transform': false, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece', 'win': 'player1'};
									}
									return {'player': 'player1', 'issue': 'eaten', 'transform': false, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece'};
								}
							}
							else {console.log('[Move]: No adverse piece at '+(p2i+p1i)/2+' '+(p2j+p1j)/2); return false;}
						}
						if (p1i - p2i == 1 && Math.abs(p2j - p1j) == 1) {
							//coup simple
							this.data_game[p1i][p1j] = 0;
							if (p2i == 0) {
								//transformation en dame
								this.data_game[p2i][p2j] = 2;
								return {'player': 'player1', 'issue': 'simple', 'transform': true, 'pieceType': 'piece'};
							}
							else {
								//pas de transformation
								this.data_game[p2i][p2j] = 1;
								return {'player': 'player1', 'issue': 'simple', 'transform': false, 'pieceType': 'piece'};
							}
						}
						//si aucun des cas dessus avec pion simple
						console.log('[Move]: Impossible move with simple piece');
						return false;
					}
					if (this.data_game[p1i][p1j] == 2) {
						//coup avec dame
						if (Math.abs(p1i-p2i) == Math.abs(p1j-p2j)) {
							//le coup est valide
							var posList = this.NbBetween(player, p1i, p1j, p2i, p2j);
							if (this.NbBetween(this.getOtherPlayer(player), p1i, p1j, p2i, p2j).length == 1) {
								if (posList.length == 0) {
									//pas de pion mangé
									this.data_game[p1i][p1j] = 0;
									this.data_game[p2i][p2j] = 2;
									return {'player': 'player1', 'issue': 'simple', 'transform': false, 'pieceType': 'dame'};
								}
								if (posList.length == 1) {
									//présence d'un pion
									this.data_game[p1i][p1j] = 0;
									this.data_game[p2i][p2j] = 2;
									this.data_game[posList[0].i][posList[0].j] = 0;
									this.eaten1 += 1;
									if (this.isWon(player)) {
										return {'player': 'player1', 'issue': 'eaten', 'transform': false, 'posEaten': posList[0], 'pieceType': 'dame', 'win': 'player1'};
									}
									return {'player': 'player1', 'issue': 'eaten', 'transform': false, 'posEaten': posList[0], 'pieceType': 'dame'};
								}
								//trop de pions présents
								console.log('[Move]: Too much adverse pieces NbBetween '+p1i+','+p1j+' and '+p2i+','+p2j);
								return false;
							}
							//présence de pions alliés
							console.log('[Move]: Allies pieces present between '+p1i+','+p1j+' and '+p2i+','+p2j);
							return false;
						}
						console.log('[Move]: Impossible move with a dame');
						return false;
					}
					console.log('[Move]: Invalid selection (inside move) at '+p1i+','+p1j);
					return false;
				}

				//cas joueur 2
				if (player == this.player2) {
					if (this.data_game[p1i][p1j] == -1) {
						//pion normal
						if (Math.abs(p2i - p1i) == 2 && Math.abs(p2j - p1j) == 2) {
							//coup attaque
							if (this.data_game[(p2i+p1i)/2][(p2j+p1j)/2] >= 1) {
								//présence d'un pion ennemi
								this.data_game[(p2i+p1i)/2][(p2j+p1j)/2] = 0;
								this.data_game[p1i][p1j] = 0;
								this.eaten2 += 1;
								if (p2i == 9) {
									//transformation en dame
									this.data_game[p2i][p2j] = -2;
									if (this.isWon(player)) {
										return {'player': 'player2', 'issue': 'eaten', 'transform': true, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece', 'win': 'player2'};
									}
									return {'player': 'player2', 'issue': 'eaten', 'transform': true, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece'};
								}
								else {
									//pas de transformation
									this.data_game[p2i][p2j] = -1;
									if (this.isWon(player)) {
										return {'player': 'player2', 'issue': 'eaten', 'transform': false, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece', 'win': 'player2'};
									}
									return {'player': 'player2', 'issue': 'eaten', 'transform': false, 'posEaten': {'i':(p2i+p1i)/2, 'j':(p2j+p1j)/2}, 'pieceType': 'piece'};
								}
							}
							else {console.log('[Move]: No adverse piece at '+(p2i+p1i)/2+' '+(p2j+p1j)/2); return false;}
						}
						if (p1i - p2i == -1 && Math.abs(p2j - p1j) == 1) {
							//coup simple
							this.data_game[p1i][p1j] = 0;
							if (p2i == 9) {
								//transformation en dame
								this.data_game[p2i][p2j] = -2;
								return {'player': 'player2', 'issue': 'simple', 'transform': true, 'pieceType': 'piece'};
							}
							else {
								//pas de transformation
								this.data_game[p2i][p2j] = -1;
								return {'player': 'player2', 'issue': 'simple', 'transform': false, 'pieceType': 'piece'};
							}
						}
						//si aucun des cas dessus avec pion simple
						console.log('[Move]: Impossible move with simple piece');
						return false;
					}
					if (this.data_game[p1i][p1j] == -2) {
						//coup avec dame
						if (Math.abs(p1i-p2i) == Math.abs(p1j-p2j)) {
							//le coup est valide
							var posList = this.NbBetween(player, p1i, p1j, p2i, p2j);
							if (this.NbBetween(this.getOtherPlayer(player), p1i, p1j, p2i, p2j).length == 1) {
								if (posList.length == 0) {
									//pas de pion mangé
									this.data_game[p1i][p1j] = 0;
									this.data_game[p2i][p2j] = -2;
									return {'player': 'player2', 'issue': 'simple', 'transform': false, 'pieceType': 'dame'};
								}
								if (posList.length == 1) {
									//présence d'un pion
									this.data_game[p1i][p1j] = 0;
									this.data_game[p2i][p2j] = -2;
									this.data_game[posList[0].i][posList[0].j] = 0;
									this.eaten2 += 1;
									if (this.isWon(player)) {
										return {'player': 'player2', 'issue': 'eaten', 'transform': false, 'posEaten': posList[0], 'pieceType': 'dame', 'win': 'player2'};
									}
									return {'player': 'player2', 'issue': 'eaten', 'transform': false, 'posEaten': posList[0], 'pieceType': 'dame'};
								}
								//trop de pions présents
								console.log('[Move]: Too much pieces NbBetween '+p1i+','+p1j+' and '+p2i+','+p2j);
								return false;
							}
							//présence de pions alliés
							console.log('[Move]: Allies pieces present between '+p1i+','+p1j+' and '+p2i+','+p2j);
							return false;
						}
						console.log('[Move]: Impossible move with a dame');
						return false;
					}
					console.log('[Move]: Invalid selection (inside move) at '+p1i+','+p1j);
					return false;
				}

				//aucun joueur valide
				console.log('[Move]: Invalid player');
				return false;
			}
			else {console.log('[Move]: Not empty target at '+p2i+' '+p2j); return false;}
		}
		else {console.log('[Move]: Invalid selection at '+p1i+' '+p1j); return false;}
	}

	validMoveEating(player,p1i,p1j,p2i,p2j) {
		if (this.validSelection(player, p1i, p1j)) {
			if (this.data_game[p2i][p2j] == 0) {
				//selection valide et pas de pion sur la case cible

				if (player == this.player1) {
					if (this.data_game[p1i][p1j] == 1) {
						//pion normal
						if (Math.abs(p2i - p1i) == 2 && Math.abs(p2j - p1j) == 2) {
							//coup attaque valide
							if (this.data_game[(p2i+p1i)/2][(p2j+p1j)/2] <= -1) {
								//présence d'un pion ennemi
								return true
							}
						}
					}
					if (this.data_game[p1i][p1j] == 2) {
						//pion dame
						if (Math.abs(p1i-p2i) == Math.abs(p1j-p2j)) {
							//coup valide
							if (this.NbBetween(player,p1i,p1j,p2i,p2j).length == 1) {
								//présence d'un unique pion ennemi
								if (this.NbBetween(this.getOtherPlayer,p1i,p1j,p2i,p2j).length == 1) {
									//pas de pions alliés
									return true
								}
							}
						}
					}
				}

				if (player == this.player2) {
					if (this.data_game[p1i][p1j] == -1) {
						//pion normal
						if (Math.abs(p2i - p1i) == 2 && Math.abs(p2j - p1j) == 2) {
							//coup attaque valide
							if (this.data_game[(p2i+p1i)/2][(p2j+p1j)/2] >= 1) {
								//présence d'un pion ennemi
								return true
							}
						}
					}
					if (this.data_game[p1i][p1j] == -2) {
						//pion dame
						if (Math.abs(p1i-p2i) == Math.abs(p1j-p2j)) {
							//coup valide
							if (this.NbBetween(player,p1i,p1j,p2i,p2j).length == 1) {
								//présence d'un unique pion ennemi
								if (this.NbBetween(this.getOtherPlayer,p1i,p1j,p2i,p2j).length == 1) {
									//pas de pions alliés
									return true
								}
							}
						}
					}
				}
			}
		}

		return false
	}

	isWon(player) {
		switch (player) {
			case this.player1:
				return this.eaten1 == 20;
				break
			case this.player2:
				return this.eaten2 == 20;
		}
	}

	reload() {
		this.eaten1 = 0;
		this.eaten2 = 0;
		this.status = 'stoped';
		this.turn = 'player1';
		this.readyPlayer1 = false;
		this.readyPlayer2 = false;
		this.reloadPlayer1 = false;
		this.reloadPlayer2 = false;
		this.blows = [];
		this.data_game = [[-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
					 	[0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
					 	[-1, 0, -1, 0, -1, 0, -1, 0, -1, 0],
					 	[0, -1, 0, -1, 0, -1, 0, -1, 0, -1],
					 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					 	[0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
					 	[1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
					 	[0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
					 	[1, 0, 1, 0, 1, 0, 1, 0, 1, 0],
					 	[0, 1, 0, 1, 0, 1, 0, 1, 0, 1]];
	}

	test() {
		return "turtle"
	}


}

module.exports.Game2 = Game;