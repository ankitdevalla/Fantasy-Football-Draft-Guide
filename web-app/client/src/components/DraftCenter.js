import React, { useState } from 'react';
import axios from 'axios';

const DraftCenter = () => {
  const [draftPick, setDraftPick] = useState('');
  const [totalTeams, setTotalTeams] = useState('');
  const [rounds, setRounds] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [team, setTeam] = useState([]);
  const [participants, setParticipants] = useState([]); // Track all participants

  const startDraft = () => {
    axios.post('http://localhost:8000/api/draft/start', { draftPick, totalTeams, rounds })
      .then(response => {
        console.log(response.data);
        alert('Draft started!');
      })
      .catch(error => {
        console.error('Error starting draft:', error);
      });
  };

  const addPlayerToTeam = () => {
    const playerName = prompt('Enter player name:'); // Case insensitive input

    if (!playerName) return;

    const playerData = {
      playerName,
      // Assume you fetch or calculate other player data from somewhere
      position: 'RB',
      rank: 1,
      tiers: 1,
      avgPoints: 10,
      sosSeason: 3,
    };

    axios.post('http://localhost:8000/api/draft/add-player', { playerName, participantName, playerData })
      .then(response => {
        console.log(response.data);
        setTeam([...team, playerData]);

        // Track participant names to later delete them
        if (!participants.includes(participantName)) {
          setParticipants([...participants, participantName]);
        }
      })
      .catch(error => {
        console.error('Error adding player:', error);
      });
  };

  const exitDraft = () => {
    axios.post('http://localhost:8000/api/draft/exit', { participantNames: participants })
      .then(response => {
        console.log(response.data);
        alert('Draft exited, all teams deleted.');
        setTeam([]); // Clear the team from the frontend
        setParticipants([]); // Clear the participants list
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

      <button onClick={startDraft}>Start Draft</button>
      <button onClick={exitDraft}>Exit Draft</button>

      <h3>Add Player to Team</h3>
      <button onClick={addPlayerToTeam}>Add Player</button>

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
