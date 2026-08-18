# Loragent Architecture

The following diagram illustrates the flow and hierarchy of the Loragent Ecosystem, featuring Boss Mode orchestration, the 4 Formation Modes, and the Firebase Self-Improvement Loop via the Gold Collector.

```mermaid
flowchart TD
    %% Core Inputs
    User(["Human User / Developer"])
    Teacher["loragent-teacher\n(Prompt Clarification)"]
    Boss{"loragent-boss\n(Central Orchestrator)"}

    %% Formation Modes (The 4 Squads)
    subgraph FormationEngine ["Dynamic Formation Engine"]
        AutoTeam["Auto Team Formation\n(Standard Engineering)"]
        Office["Office Formation\n(Business / Marketing)"]
        Freelance["Freelance Formation\n(Single Task Execution)"]
        Chela["Chela Formation\n(Aggressive Bug Hunting)"]
    end

    %% Key Agents for Auto Team
    subgraph AutoTeamAgents ["Engineering Squad"]
        TechDir["loragent-tech-director"]
        Backend["loragent-backend-se"]
        Frontend["loragent-frontend-se"]
        QA["loragent-sqa"]
    end

    %% Key Agents for Office
    subgraph OfficeAgents ["Business Squad"]
        PM["loragent-project-coordinator"]
        Marketing["loragent-marketing-strategy-manager"]
        Publisher["loragent-publisher"]
    end

    %% Single / Chela Agents
    SoloAgent["Specialist Agents\n(e.g. 3D Designer, Animator)"]
    ChelaSquad["Chela Squad\n(Bug Hunter + Shift Engineer)"]

    %% MCP Server & Communication
    subgraph MCPServer ["Loragent Native MCP Server"]
        Steer["loragent_steer()"]
        Hook["loragent_trigger_hook()"]
        State["loragent_get_state()"]
    end

    %% Self Improvement Loop
    subgraph FirebaseLoop ["Self-Improvement Loop"]
        GoldCollector["loragent-gold-collector\n(Novelty Mining)"]
        DBUpdater["loragent-database-updater"]
        Firebase[("Global Hivemind\n(Firebase DB)")]
    end
    
    %% Connections
    User -- "Task / Prompt" --> Teacher
    Teacher -- "Clarified Requirements" --> Boss
    
    Boss -- "Evaluates Scope" --> FormationEngine
    
    AutoTeam --> AutoTeamAgents
    Office --> OfficeAgents
    Freelance --> SoloAgent
    Chela --> ChelaSquad

    %% MCP Connections
    AutoTeamAgents -. "Handoff Context" .-> Steer
    OfficeAgents -. "Handoff Context" .-> Steer
    SoloAgent -. "Handoff Context" .-> Steer
    ChelaSquad -. "Handoff Context" .-> Steer
    
    Steer -. "Routes Data" .-> Boss

    %% Firebase Loop Connections
    Boss -- "Monitors Workflow" --> GoldCollector
    GoldCollector -- "Extracts & Scrubs Novelty" --> DBUpdater
    DBUpdater -- "Syncs Knowledge" --> Firebase
    Firebase -. "Queries Memory" .-> Boss

    %% Styling
    classDef primary fill:#4A90E2,stroke:#333,stroke-width:2px,color:#fff;
    classDef secondary fill:#50E3C2,stroke:#333,stroke-width:2px,color:#000;
    classDef db fill:#F5A623,stroke:#333,stroke-width:2px,color:#000;

    class Boss,Teacher primary;
    class AutoTeam,Office,Freelance,Chela secondary;
    class Firebase db;
```
