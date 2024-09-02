import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DraftCenter = () => {
  const [draftPick, setDraftPick] = useState('');
  const [totalTeams, setTotalTeams] = useState('');
  const [rounds, setRounds] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [team, setTeam] = useState([]);
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
      })
      .catch(error => {
        console.error('Error starting draft:', error);
      });
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
            setTeam([...team, playerData]);

            if (!participants.includes(participantName)) {
              setParticipants([...participants, participantName]);
            }

            setPlayerName(''); // Clear the player name input
          })
          .catch(error => {
            if (error.response && error.response.status === 404) {
              // Player not found in available players, meaning they've already been picked
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
        setTeam([]);
        setParticipants([]);
        setDraftPick('');
        setTotalTeams('');
        setRounds('');
        setParticipantName('');
        setDraftPick('');
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

      <div>
        <label>Participant Name: </label>
        <input type="text" value={participantName} onChange={(e) => setParticipantName(e.target.value)} />
      </div>

      <button onClick={startDraft} disabled={isDraftStarted}>Start Draft</button>
      <button onClick={exitDraft} disabled={!isDraftStarted}>Exit Draft</button>

      <h3>Add Player to Team</h3>
      <div>
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

      <h3>Your Team</h3>
      <ul>
        {team.map((player, index) => (
          <li key={index}>{player.playerName} - {player.position}</li>
        ))}
      </ul>
    </div>
  );
};

export default DraftCenter;
