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
  const [playerNames, setPlayerNames] = useState([]); // To store all possible player names
  const [isDraftStarted, setIsDraftStarted] = useState(false); // Track if draft is started

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
        setIsDraftStarted(true); // Mark the draft as started
        const participantsList = generateParticipants(totalTeams); // Generate participants
        setParticipants(participantsList);
        initializeTeams(totalTeams); // Initialize team objects
        setParticipantName(participantsList[0]); // Set the initial participant to team_1
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

  const nextPick = () => {
    let nextPick = currentPick;
    let nextRound = currentRound;

    if (currentRound % 2 === 1) {
      // Odd round (normal order)
      nextPick = currentPick + 1;
      if (nextPick > totalTeams) {
        nextRound += 1;
        nextPick = totalTeams; // Last team for the next round (reversed)
      }
    } else {
      // Even round (reverse order)
      nextPick = currentPick - 1;
      if (nextPick < 1) {
        nextRound += 1;
        nextPick = 1; // First team for the next round (normal)
      }
    }

    if (nextRound > rounds) {
      alert('Draft complete!');
      exitDraft(); // Automatically exit the draft when complete
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

    // Fetch player data from the server
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

            setPlayerName(''); // Clear the player name input

            // Move to the next pick
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
        setIsDraftStarted(false); // Reset draft status
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
