import React from 'react';

interface CardProps {
  title?: string;
  icon?: React.ComponentType<{ size?: number; color?: string; style?: React.CSSProperties }>;
  badgeText?: string;
  badgeType?: 'info' | 'success' | 'warning' | 'danger';
  extraAction?: React.ReactNode;
  children?: React.ReactNode;
  style?: React.CSSProperties;
}

export default function Card({ 
  title, 
  icon: Icon, 
  badgeText, 
  badgeType = 'info', 
  extraAction, 
  children, 
  style = {} 
}: CardProps) {
  const getBadgeClass = () => {
    switch (badgeType) {
      case 'success': return 'badge badge-success';
      case 'warning': return 'badge badge-warning';
      case 'danger': return 'badge badge-danger';
      default: return 'badge badge-info';
    }
  };

  return (
    <div className="card" style={{ ...styles.card, ...style }}>
      {(title || Icon || badgeText || extraAction) && (
        <div style={styles.cardHeader}>
          <div style={styles.headerLeft}>
            {Icon && <Icon size={16} color="#111111" style={{ marginRight: '4px' }} />}
            {title && <h3 style={styles.title}>{title}</h3>}
            {badgeText && <span className={getBadgeClass()}>{badgeText}</span>}
          </div>
          {extraAction && <div style={styles.headerRight}>{extraAction}</div>}
        </div>
      )}
      <div style={styles.cardContent}>
        {children}
      </div>
    </div>
  );
}

const styles = {
  card: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '1rem',
    borderBottom: '1px solid #eaeaea',
    paddingBottom: '0.625rem',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '0.375rem',
  },
  title: {
    margin: 0,
    fontSize: '0.925rem',
    fontWeight: '600',
    color: '#111111',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  }
};
