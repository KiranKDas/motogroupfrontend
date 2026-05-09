import React, { useState, useEffect } from 'react';
import { getMotorcycles, addMotorcycle, addMaintenanceLog, getMaintenanceLogs, updateMemberSafety } from './api';

export default function Garage() {
  const [bikes, setBikes] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [make, setMake] = useState('');
  const [model, setModel] = useState('');
  const [year, setYear] = useState('');
  const [mileage, setMileage] = useState('');
  const [error, setError] = useState('');

  const [loggingServiceFor, setLoggingServiceFor] = useState(null);
  const [serviceType, setServiceType] = useState('');
  const [serviceCost, setServiceCost] = useState('');
  const [serviceMileage, setServiceMileage] = useState('');
  const [allLogs, setAllLogs] = useState([]);

  const checkSafety = (currentMileage, logs) => {
    let lastOil = 0, lastTire = 0, lastChain = 0;
    logs.forEach(log => {
      const type = (log.serviceType || log.ServiceType || '').toLowerCase();
      const logMileage = parseInt(log.mileage || log.Mileage || 0, 10);
      if (type.includes('oil')) lastOil = Math.max(lastOil, logMileage);
      if (type.includes('tire')) lastTire = Math.max(lastTire, logMileage);
      if (type.includes('chain')) lastChain = Math.max(lastChain, logMileage);
    });
    const oilSafe = currentMileage - lastOil <= 1000;
    const tireSafe = currentMileage - lastTire <= 10000;
    const chainSafe = currentMileage - lastChain <= 500;
    return oilSafe && tireSafe && chainSafe;
  };

  const refreshGarageData = async () => {
    try {
      const fetchedBikes = await getMotorcycles();
      let allLogsArr = [];

      const bikesWithDetails = await Promise.all((fetchedBikes || []).map(async (bike) => {
        let totalCost = 0;
        let currentMileage = parseInt(bike.mileage || 0, 10);
        let logs = [];

        try {
          const bikeId = bike.id || bike.Id;
          logs = await getMaintenanceLogs(bikeId) || [];
          totalCost = logs.reduce((sum, log) => sum + parseFloat(log.cost || log.Cost || 0), 0);
          
          // Update current mileage based on the highest logged mileage
          currentMileage = Math.max(currentMileage, ...logs.map(l => parseInt(l.mileage || l.Mileage || 0, 10)));
          
          logs.forEach(log => allLogsArr.push({ ...log, bikeName: `${bike.make} ${bike.model}` }));
        } catch (err) {
          console.warn(`Could not fetch logs for bike ${bike.id}`, err);
        }

        const isSafe = checkSafety(currentMileage, logs);

        return { ...bike, id: bike.id || bike.Id, mileage: currentMileage, is_safe: isSafe, total_cost: totalCost };
      }));
      
      setAllLogs(allLogsArr.sort((a, b) => new Date(b.serviceDate || b.ServiceDate) - new Date(a.serviceDate || a.ServiceDate)));
      setBikes(bikesWithDetails);

      // Sync overall safety status up to the Club Service database
      const overallSafety = bikesWithDetails.length > 0 ? bikesWithDetails.every(b => b.is_safe) : true;
      const bikeList = bikesWithDetails.length > 0 ? JSON.stringify(bikesWithDetails.map(b => ({ name: `${b.make} ${b.model}`, isSafe: b.is_safe }))) : JSON.stringify([]);
      try {
        await updateMemberSafety({ isSafe: overallSafety, bike: bikeList });
      } catch (err) {
        console.warn("Could not sync safety status with club service", err);
      }
    } catch (error) {
      console.error("Error fetching garage data:", error);
      setError(error.message || "Failed to load garage data.");
    }
  };

  useEffect(() => {
    refreshGarageData();
  }, []);

  const handleAddBike = async (e) => {
    e.preventDefault();
    try {
      await addMotorcycle({ make, model, year: parseInt(year), mileage: parseInt(mileage) });
      await refreshGarageData();
      setIsAdding(false);
      setMake(''); setModel(''); setYear(''); setMileage('');
    } catch (err) {
      setError(err.message || "Error adding motorcycle.");
    }
  };

  const handleLogService = async (e, bikeId) => {
    e.preventDefault();
    try {
      await addMaintenanceLog({
        motorcycleId: parseInt(bikeId, 10),
        serviceDate: new Date().toISOString(),
        serviceType,
        mileage: parseInt(serviceMileage, 10),
        cost: parseFloat(serviceCost)
      });

      await refreshGarageData();
      setLoggingServiceFor(null);
    } catch (err) {
      setError(err.message || "Error logging service.");
    }
  };

  return (
    <div>
      <div className="flex-between mb-4">
        <h2 style={{ margin: 0 }}>My Garage & Maintenance</h2>
        <button onClick={() => setIsAdding(!isAdding)}>{isAdding ? 'Cancel' : '+ Add Motorcycle'}</button>
      </div>
      
      {error && <p style={{ color: 'var(--danger)' }} className="mb-4">Error: {error}</p>}

      {isAdding && (
        <div className="card mb-4">
          <form className="inline-form" onSubmit={handleAddBike}>
            <input placeholder="Make (e.g. Yamaha)" required value={make} onChange={e => setMake(e.target.value)} />
            <input placeholder="Model (e.g. MT-07)" required value={model} onChange={e => setModel(e.target.value)} />
            <input type="number" placeholder="Year" required value={year} onChange={e => setYear(e.target.value)} />
            <input type="number" placeholder="Mileage" required value={mileage} onChange={e => setMileage(e.target.value)} />
            <button type="submit">Save Asset</button>
          </form>
        </div>
      )}

      <div className="grid">
        {bikes.map(bike => (
          <div key={bike.id} className="card">
            <h3 className="mb-3">{bike.make} {bike.model}</h3>
            <p><strong>Mileage:</strong> {bike.mileage.toLocaleString()} mi</p>
            <p><strong>Total Cost:</strong> {new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(bike.total_cost || 0)}</p>
            <p className="mb-4"><strong>Health:</strong> <span className={`badge ${bike.is_safe ? 'success' : 'danger'}`}>{bike.is_safe ? 'Safe (Up to date)' : 'Service Required'}</span></p>
            
            {loggingServiceFor === bike.id ? (
              <form className="inline-form" onSubmit={(e) => handleLogService(e, bike.id)} style={{ flexDirection: 'column', alignItems: 'stretch' }}>
                <input placeholder="Service Type (e.g. Oil Change)" required value={serviceType} onChange={e => setServiceType(e.target.value)} />
                <input type="number" step="0.01" placeholder="Cost" required value={serviceCost} onChange={e => setServiceCost(e.target.value)} />
                <input type="number" placeholder="New Mileage" required value={serviceMileage} onChange={e => setServiceMileage(e.target.value)} />
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button type="submit" style={{ flex: 1 }}>Save</button>
                  <button type="button" className="secondary" style={{ flex: 1 }} onClick={() => setLoggingServiceFor(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <button className="secondary" style={{ width: '100%' }} onClick={() => { setLoggingServiceFor(bike.id); setServiceType(''); setServiceCost(''); setServiceMileage(bike.mileage || ''); }}>Log Service</button>
            )}
          </div>
        ))}
      </div>

      <h3 style={{ marginTop: '40px' }} className="mb-3">Service History</h3>
      <div className="card table-responsive" style={{ padding: '0' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
              <th style={{ padding: '15px' }}>Date</th>
              <th style={{ padding: '15px' }}>Motorcycle</th>
              <th style={{ padding: '15px' }}>Service</th>
              <th style={{ padding: '15px' }}>Mileage</th>
              <th style={{ padding: '15px' }}>Cost</th>
            </tr>
          </thead>
          <tbody>
            {allLogs.length > 0 ? allLogs.map(log => (
              <tr key={log.id || Math.random()} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '15px' }}>{new Date(log.serviceDate || log.ServiceDate).toLocaleDateString()}</td>
                <td style={{ padding: '15px' }}>{log.bikeName}</td>
                <td style={{ padding: '15px' }}>{log.serviceType || log.ServiceType}</td>
                <td style={{ padding: '15px' }}>{(log.mileage || log.Mileage).toLocaleString()} mi</td>
                <td style={{ padding: '15px' }}>{new Intl.NumberFormat('en-US', { style: 'currency', currency: 'INR' }).format(parseFloat(log.cost || log.Cost).toFixed(2))}</td>
              </tr>
            )) : <tr><td colSpan="5" style={{ padding: '15px', textAlign: 'center' }} className="text-muted">No service logs found.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}