import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { getClubMembers, getMyClubs, createClub, updateUserRole, inviteClubMember, getMotorcycles, removeClubMember, acceptClubInvite, leaveClub } from './api';

export default function Clubs({ setActiveTab }) {
  const { user, promoteToCaptain } = useAuth();
  const isCaptain = user?.isCaptain;

  const [members, setMembers] = useState([]);
  const [myClubs, setMyClubs] = useState([]);
  const [error, setError] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [isInviting, setIsInviting] = useState(false);
  const [inviteUsername, setInviteUsername] = useState('');
  const [clubName, setClubName] = useState('');

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const data = await getClubMembers();
        setMembers(data || []);
      } catch (err) {
        console.error("Error fetching club members:", err);
        setError(err.message || "Failed to load club members. Service might be down.");
      }
    };

      const fetchClubs = async () => {
        try {
          const data = await getMyClubs();
          setMyClubs(data || []);
        } catch (err) {
          console.error("Error fetching clubs:", err);
          setError(err.message || "Failed to load clubs. Service might be down.");
        }
      };

      if (isCaptain) {
        fetchMembers();
      } else {
        fetchClubs();
      }
    }, [isCaptain]);

  const handleCreateClub = async (e) => {
    e.preventDefault();
    setError('');
    try {
      let bikeList = JSON.stringify([]);
      try {
        const bikes = await getMotorcycles();
        if (bikes && bikes.length > 0) {
          bikeList = JSON.stringify(bikes.map(b => ({ name: `${b.make} ${b.model}`, isSafe: b.is_safe ?? true })));
        }
      } catch (err) {
        console.warn("Could not fetch motorcycles for captain", err);
      }

      await createClub({ 
        name: clubName,
        captainId: user.userId || user.userid,
        captainUsername: user.username,
        bike: bikeList
      });
      await updateUserRole(user.username, 'ClubCaptain');
      promoteToCaptain();
      setIsCreating(false);
      setClubName('');
      // Refetch immediately so the UI flips to the dashboard instantly
      const data = await getClubMembers();
      setMembers(data || []);
    } catch (err) {
      setError(err.message || "Failed to create club. Service might be down.");
    }
  };

  const handleInvite = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await inviteClubMember({ username: inviteUsername, bike: JSON.stringify([]) });
      setIsInviting(false);
      setInviteUsername('');
      
      // Refetch the members list to show the newly invited rider
      const data = await getClubMembers();
      setMembers(data || []);
    } catch (err) {
      setError(err.message || "Failed to invite rider. Service might be down.");
    }
  };

  const handleRemoveMember = async (memberId) => {
    if (window.confirm("Are you sure you want to remove this rider from the club?")) {
      try {
        await removeClubMember(memberId);
        setMembers(members.filter(m => m.id !== memberId));
      } catch (err) {
        setError(err.message || "Failed to remove member.");
      }
    }
  };

  const handleAcceptInvite = async (clubId) => {
    try {
      let bikeList = JSON.stringify([]);
      let overallSafety = true;
      try {
        const bikes = await getMotorcycles();
        if (bikes && bikes.length > 0) {
          bikeList = JSON.stringify(bikes.map(b => ({ name: `${b.make} ${b.model}`, isSafe: b.is_safe ?? true })));
          overallSafety = bikes.every(b => b.is_safe ?? true);
        }
      } catch (err) {
        console.warn("Could not fetch motorcycles", err);
      }

      await acceptClubInvite(clubId, { isSafe: overallSafety, bike: bikeList });
      
      const data = await getMyClubs();
      setMyClubs(data || []);
    } catch (err) {
      setError(err.message || "Failed to accept invite.");
    }
  };

  const handleRejectInvite = async (clubId) => {
    try {
      await leaveClub(clubId);
      const data = await getMyClubs();
      setMyClubs(data || []);
    } catch (err) {
      setError(err.message || "Failed to reject invite.");
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h2 style={{ margin: 0 }}>Club Management</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          {!isCaptain && myClubs.length === 0 && (
            <button type="button" style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }} onClick={() => setIsCreating(!isCreating)}>{isCreating ? 'Cancel' : 'Create New Group'}</button>
          )}
          {isCaptain && (
            <button type="button" style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }} onClick={() => setIsInviting(!isInviting)}>{isInviting ? 'Cancel' : 'Add Rider'}</button>
          )}
        </div>
      </div>

      {error && <p style={{ color: 'var(--danger)' }} className="mb-4">Error: {error}</p>}

      {isCreating && (
        <div className="card mb-4">
          <h3 className="mb-3">Create a New Club</h3>
          <form className="inline-form" onSubmit={handleCreateClub}>
            <input placeholder="Club Name (e.g. Apex Riders)" required value={clubName} onChange={e => setClubName(e.target.value)} />
            <button type="submit">Create & Become Captain</button>
          </form>
        </div>
      )}

      {isInviting && (
        <div className="card mb-4">
          <h3 className="mb-3">Invite Rider to Club</h3>
          <form className="inline-form" onSubmit={handleInvite}>
            <input placeholder="Username" required value={inviteUsername} onChange={e => setInviteUsername(e.target.value)} />
            <button type="submit" style={{ position: 'relative', zIndex: 50, cursor: 'pointer' }}>Invite Rider</button>
          </form>
        </div>
      )}

      {(isCaptain ? members.length > 0 : myClubs.length > 0) ? (
        <div className="card">
          <h3>Your Club <span className="text-muted">({isCaptain ? 'You are the Captain' : 'Member'})</span></h3>
          {isCaptain ? (
            <div style={{ marginTop: '20px' }}>
              <h4>Captain's Safety Dashboard</h4>
              <div className="table-responsive">
                <table>
                  <thead>
                    <tr><th>Rider</th><th>Motorcycle</th><th>Maintenance Status</th><th>Action</th></tr>
                  </thead>
                  <tbody>
                    {members.flatMap(m => {
                      let bikes = [];
                      try {
                        const parsed = JSON.parse(m.bike);
                        if (Array.isArray(parsed) && parsed.length > 0) {
                          bikes = parsed;
                        } else if (Array.isArray(parsed) && parsed.length === 0) {
                          bikes = [{ name: 'No bikes', isSafe: m.is_safe }];
                        } else {
                          throw new Error("Not an array");
                        }
                      } catch(e) {
                        // Fallback for old string format (like when a user is first invited)
                        const bikeNames = m.bike && m.bike !== 'No bikes' ? m.bike.split(', ') : ['No bikes'];
                        bikes = bikeNames.map(b => ({ name: b, isSafe: m.is_safe }));
                      }
                      
                      return bikes.map((b, index) => (
                        <tr key={`${m.id}-${index}`}>
                          <td>{m.name}</td>
                          <td>{b.name}</td>
                          <td><span className={`badge ${b.isSafe ? 'success' : 'danger'}`}>{b.isSafe ? '🟢 Safe(Up to date)' : '🔴 Requires Attention(Service Required)'}</span></td>
                          <td>
                            <button 
                              className="secondary" 
                              style={{ padding: '6px 12px' }} 
                              onClick={() => m.name === user.username && setActiveTab ? setActiveTab('garage') : handleRemoveMember(m.id)}
                            >
                              {m.name === user.username ? 'My Garage' : 'Remove'}
                            </button>
                          </td>
                        </tr>
                      ));
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div style={{ marginTop: '20px' }}>
              <p>You are a member of these clubs. Only the Captain can see the Safety Dashboard.</p>
              <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
                {myClubs.map(c => (
                  <li key={c.id || c.Id} className="mb-3 card" style={{ padding: '15px' }}>
                    <div className="flex-between">
                      <div>
                        <strong>{c.name || c.Name}</strong> - Captain: {c.captainUsername || c.CaptainUsername}
                      </div>
                      {c.isPending || c.IsPending ? (
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button style={{ padding: '6px 12px' }} onClick={() => handleAcceptInvite(c.id || c.Id)}>Accept</button>
                          <button className="secondary" style={{ padding: '6px 12px' }} onClick={() => handleRejectInvite(c.id || c.Id)}>Reject</button>
                        </div>
                      ) : (
                        <span className="badge success">Member</span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      ) : (
        !isCreating && !error && (
          <p className="text-muted" style={{ textAlign: 'center', marginTop: '40px' }}>
            You are not currently part of any club.
          </p>
        )
      )}
    </div>
  );
}