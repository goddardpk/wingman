# Wingman

Wingman is a platform designed to empower drivers to support and elevate each other through a peer-to-peer support network. The application rewards drivers who help their fellow drivers, fostering a strong regional service network and building expertise within local service areas.

## Core Concept: Driver Supporting Driver

The Wingman platform is built on a simple yet powerful idea: experienced drivers supporting newer drivers creates the strongest possible local service network. By helping other drivers succeed, drivers earn ranking credits and progress toward achieving the prestigious "Wingman" status.

## Ranking System Progression

### 1. Rookie (0-100 credits)
- Basic support capabilities
- Can request assistance
- Learning the support system

### 2. Supporter (101-300 credits)
- Can provide basic assistance
- Access to support request notifications
- Regional area stats visible

### 3. Navigator (301-600 credits)
- Can mentor new drivers
- Regional expertise recognition
- Support activity history tracking
- Priority matching for support requests

### 4. Guardian (601-1000 credits)
- Advanced mentoring capabilities
- Regional strategy input
- Support network leadership
- Custom support activity creation

### 5. Wingman (1000+ credits)
- Highest rank achievement
- Regional leadership role
- Strategy development participation
- Network optimization input
- Special recognition and rewards
- Advanced support tools access

## Support Activities and Credit Earning

### Real-Time Support (10-30 credits)
- Emergency assistance (30 credits)
- Route optimization (15 credits)
- Customer service advice (10 credits)
- Technical support (15 credits)

### Mentoring (20-50 credits)
- New driver orientation (50 credits)
- Regional area training (40 credits)
- Best practices sharing (20 credits)
- Safety protocol training (30 credits)

### Regional Expertise (15-40 credits)
- Local event guidance (15 credits)
- Area-specific tips (20 credits)
- Traffic pattern sharing (25 credits)
- Hotspot optimization (40 credits)

### Community Building (10-30 credits)
- Support network meetings (20 credits)
- Regional driver meetups (30 credits)
- Best practices documentation (15 credits)
- Success story sharing (10 credits)

## Support Network Scenarios

### Scenario 1: Emergency Support
```
A new driver's vehicle has a flat tire during peak hours.
1. Driver activates emergency support request
2. Nearby Guardian/Wingman receives notification
3. Supporter provides immediate guidance
4. Follow-up report filed
5. Credits awarded for emergency assistance
```

### Scenario 2: Regional Training
```
Experienced Navigator helps new drivers learn the area.
1. Navigator creates training session
2. Rookies join the session
3. Area-specific knowledge shared
4. Practical exercises completed
5. Credits awarded for training delivery
```

### Scenario 3: Peak Period Optimization
```
Wingman leads strategy for holiday event.
1. Creates regional action plan
2. Coordinates driver positioning
3. Monitors real-time performance
4. Adjusts strategy as needed
5. Credits awarded for strategic leadership
```

### Scenario 4: Network Building
```
Guardian organizes local driver meetup.
1. Plans regional gathering
2. Facilitates knowledge sharing
3. Documents best practices
4. Builds community connections
5. Credits awarded for community building
```

## Features

### Driver Support Network
- Real-time assistance matching
- Support activity tracking
- Credit calculation system
- Regional expertise sharing
- Peer-to-peer communication tools
- Emergency response coordination

### Ranking Management
- Progress tracking
- Achievement system
- Support history
- Credit accumulation
- Rank advancement notifications
- Regional leadership boards

### Regional Excellence
- Area-specific metrics
- Performance tracking
- Support network density
- Service quality indicators
- Community engagement levels

## Database Schema

### Drivers Table
```sql
CREATE TABLE drivers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    driver_id TEXT UNIQUE NOT NULL,
    service_type TEXT CHECK(service_type IN ('Economy', 'Comfort', 'Premium')),
    current_rank TEXT CHECK(current_rank IN ('Rookie', 'Supporter', 'Navigator', 'Guardian', 'Wingman')),
    total_credits INTEGER DEFAULT 0,
    region TEXT NOT NULL,
    active_status TEXT CHECK(active_status IN ('active', 'available', 'supporting', 'offline')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Support Activities Table
```sql
CREATE TABLE support_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    supporter_id INTEGER,
    supported_id INTEGER,
    activity_type TEXT CHECK(activity_type IN ('emergency', 'mentoring', 'regional', 'community')),
    activity_subtype TEXT NOT NULL,
    credits_earned INTEGER,
    region TEXT NOT NULL,
    status TEXT CHECK(status IN ('ongoing', 'completed', 'verified')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    FOREIGN KEY (supporter_id) REFERENCES drivers(id),
    FOREIGN KEY (supported_id) REFERENCES drivers(id)
);
```

### Regional Stats Table
```sql
CREATE TABLE regional_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    region TEXT NOT NULL,
    total_support_activities INTEGER DEFAULT 0,
    active_supporters INTEGER DEFAULT 0,
    wingman_count INTEGER DEFAULT 0,
    average_response_time INTEGER,
    satisfaction_rating DECIMAL(3,2),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Achievement Tracking Table
```sql
CREATE TABLE achievements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    driver_id INTEGER,
    achievement_type TEXT NOT NULL,
    credits_earned INTEGER,
    description TEXT,
    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (driver_id) REFERENCES drivers(id)
);
```

[Additional sections remain unchanged...]