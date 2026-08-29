import { useEffect, useRef, useState } from 'react';
import { useAppData } from '../../context/AppDataContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUsers, faBell, faHandHoldingDroplet } from '@fortawesome/free-solid-svg-icons';
import './Stats.scss';

const useCountUp = (target: number, duration = 2000, start = false) => {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (!start) return;
    let startTimestamp: number | null = null;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeOut * target));
      
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };
    requestAnimationFrame(step);
  }, [target, duration, start]);

  return count;
};

const Stats = () => {
  const { getStats } = useAppData();
  const stats = getStats();
  
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) setIsVisible(true);
      },
      { threshold: 0.2 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }
    return () => observer.disconnect();
  }, []);

  const totalDonors = useCountUp(stats.totalDonors, 2000, isVisible);
  const activeRequests = useCountUp(stats.activeRequests, 2000, isVisible);
  const totalDonations = useCountUp(stats.totalDonations, 2000, isVisible);

  return (
    <section className="stats-section" ref={sectionRef}>
      <div className="container">
        <div className="stats-header text-center">
          <h2 className="section-title">Impact in Numbers</h2>
          <p className="section-subtitle">Real-time statistics of our life-saving community</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-card glass-panel stat-donors">
            <div className="stat-icon-wrap"><FontAwesomeIcon icon={faUsers} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{totalDonors.toLocaleString()}</h3>
              <p className="stat-label">Registered Donors</p>
            </div>
          </div>
          
          <div className="stat-card glass-panel stat-requests">
            <div className="stat-icon-wrap"><FontAwesomeIcon icon={faBell} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{activeRequests.toLocaleString()}</h3>
              <p className="stat-label">Pending Requests</p>
            </div>
          </div>
          
          <div className="stat-card glass-panel stat-donations">
            <div className="stat-icon-wrap"><FontAwesomeIcon icon={faHandHoldingDroplet} /></div>
            <div className="stat-content">
              <h3 className="stat-value">{totalDonations.toLocaleString()}+</h3>
              <p className="stat-label">Donations Made</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Stats;
