import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DraftCenter = () => {
  const [draftPick, setDraftPick] = useState('');
  const [totalTeams, setTotalTeams] = useState('');
  const [rounds, setRounds] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentPick, setCurrentPick] = useState(1);
  const [participantName, setParticipantName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [teams, setTeams] = useState({});
  const [participants, setParticipants] = useState([]);
  const [playerNames, setPlayerNames] = useState([]);
  const [isDraftStarted, setIsDraftStarted] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/draft/player-names')
      .then(response => {
        setPlayerNames(response.data);
      })
      .catch(error => {
        console.error('Error fetching player names:', error);
      });
  }, []);

  const startDraft = () => {
    axios.post('http://localhost:8000/api/draft/start', { draftPick, totalTeams, rounds })
      .then(response => {
        console.log(response.data);
        alert('Draft started!');
        setIsDraftStarted(true); 
        const participantsList = generateParticipants(totalTeams); 
        setParticipants(participantsList);
        initializeTeams(totalTeams); 
        setParticipantName(participantsList[0]); 
      })
      .catch(error => {
        console.error('Error starting draft:', error);
      });
  };

  const generateParticipants = (totalTeams) => {
    const participantsList = [];
    for (let i = 1; i <= totalTeams; i++) {
      participantsList.push(`team_${i}`);
    }
    return participantsList;
  };

  const initializeTeams = (totalTeams) => {
    const initialTeams = {};
    for (let i = 1; i <= totalTeams; i++) {
      initialTeams[`team_${i}`] = [];
    }
    setTeams(initialTeams);
  };

  const recommendPlayers = (updatedPlayerNames) => {
    const userRoster = {
      QB: teams[participantName].filter(player => player.position === 'QB').length,
      RB: teams[participantName].filter(player => player.position === 'RB').length,
      WR: teams[participantName].filter(player => player.position === 'WR').length,
      TE: teams[participantName].filter(player => player.position === 'TE').length,
      K: teams[participantName].filter(player => player.position === 'K').length,
      DST: teams[participantName].filter(player => player.position === 'DST').length,
    };

    const rosterStructure = {
      QB: 1,
      RB: 2,
      WR: 2,
      TE: 1,
      K: 1,
      DST: 1,
    };

    axios.post('http://localhost:8000/api/draft/recommend', {
      userRoster,
      availablePlayers: updatedPlayerNames,
      rosterStructure,
      topN: 3
    })
    .then(response => {
      const recommendedPlayers = response.data;
      console.log('Recommended players:', recommendedPlayers);
      setRecommendations(recommendedPlayers); 
    })
    .catch(error => {
      console.error('Error fetching recommendations:', error);
    });
  };

  useEffect(() => {
    if (isDraftStarted) {
      recommendPlayers(playerNames); 
    }
  }, [currentPick, participantName]); 

  const nextPick = () => {
    let nextPick = currentPick;
    let nextRound = currentRound;

    if (currentRound % 2 === 1) {
      nextPick = currentPick + 1;
      if (nextPick > totalTeams) {
        nextRound += 1;
        nextPick = totalTeams; 
      }
    } else {
      nextPick = currentPick - 1;
      if (nextPick < 1) {
        nextRound += 1;
        nextPick = 1; 
      }
    }

    if (nextRound > rounds) {
      alert('Draft complete!');
      exitDraft(); 
      return;
    }

    setCurrentPick(nextPick);
    setCurrentRound(nextRound);
    setParticipantName(participants[nextPick - 1]);
  };

  const addPlayerToTeam = () => {
    if (!playerName) {
      alert('Please enter a player name');
      return;
    }

    if (!playerNames.includes(playerName)) {
      alert('Invalid player name. Please choose a valid name from the list.');
      return;
    }

    axios.get(`http://localhost:8000/api/draft/player/${playerName}`)
      .then(response => {
        const playerData = response.data;

        axios.post('http://localhost:8000/api/draft/add-player', { playerName, participantName, playerData })
          .then(response => {
            console.log(response.data);
            setTeams(prevTeams => ({
              ...prevTeams,
              [participantName]: [...prevTeams[participantName], playerData]
            }));

            setPlayerNames(prevPlayerNames => prevPlayerNames.filter(name => name.toLowerCase() !== playerName.toLowerCase()));

            setPlayerName(''); 
            nextPick(); 
          })
          .catch(error => {
            if (error.response && error.response.status === 404) {
              alert(`Player ${playerName} has already been picked.`);
            } else {
              console.error('Error adding player:', error);
            }
          });
      })
      .catch(error => {
        console.error('Error fetching player data:', error);
        alert('Error fetching player data or player not found');
      });
  };

  useEffect(() => {
    if (isDraftStarted) {
      recommendPlayers(playerNames); 
    }
  }, [playerNames]); 

  const exitDraft = () => {
    axios.post('http://localhost:8000/api/draft/exit', { participantNames: participants })
      .then(response => {
        console.log(response.data);
        alert('Draft exited, all teams deleted.');
        setTeams({});
        setParticipants([]);
        setDraftPick('');
        setTotalTeams('');
        setRounds('');
        setCurrentRound(1);
        setCurrentPick(1);
        setIsDraftStarted(false); 
        setRecommendations([]); 
      })
      .catch(error => {
        console.error('Error exiting draft:', error);
      });
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Draft Center</h2>
      
      <div>
        <label>Draft Pick: </label>
        <input type="number" value={draftPick} onChange={(e) => setDraftPick(e.target.value)} />
      </div>

      <div>
        <label>Total Teams: </label>
        <input type="number" value={totalTeams} onChange={(e) => setTotalTeams(e.target.value)} />
      </div>

      <div>
        <label>Rounds: </label>
        <input type="number" value={rounds} onChange={(e) => setRounds(e.target.value)} />
      </div>

      <button onClick={startDraft} disabled={isDraftStarted}>Start Draft</button>
      <button onClick={exitDraft} disabled={!isDraftStarted}>Exit Draft</button>

      <h3>Add Player to Team</h3>
      <div>
        <label>Participant: </label>
        <input type="text" value={participantName} readOnly />

        <label>Player Name: </label>
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
          list="player-names"
          disabled={!isDraftStarted}
        />
        <datalist id="player-names">
          {playerNames.map((name, index) => (
            <option key={index} value={name} />
          ))}
        </datalist>
        <button onClick={addPlayerToTeam} disabled={!isDraftStarted}>Add Player</button>
      </div>

      {!isDraftStarted && <p>Please start the draft to add players.</p>}

      <h3>Recommended Players</h3>
      <ul>
        {recommendations.map((player, index) => (
          <li key={index}>{player.playerName} - {player.position}</li>
        ))}
      </ul>

      <h3>Teams</h3>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        {Object.keys(teams).map((teamName, index) => (
          <div key={index} style={{ flex: 1, margin: '0 10px' }}>
            <h4>{teamName}</h4>
            <ul>
              {teams[teamName].map((player, idx) => (
                <li key={idx}>{player.playerName} - {player.position}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DraftCenter;
