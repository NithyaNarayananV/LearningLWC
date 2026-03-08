import { LightningElement, track } from 'lwc';

export default class ResumeV1 extends LightningElement {
    contact = {
        name: 'C VR NITHYA NARAYANAN',
        role: 'Salesforce Developer',
        location: 'Chennai',
        phone: '+91 9445511404',
        email: ' nithyanarayanancvr@gmail.com'
    };

    certifications = [
        {
            isActive: true,
            id: 1,
            category: 'Agentforce',
            name: 'Salesforce Certified Agentforce Specialist',
            status: 'Active',
            issued: 'Apr 2025',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20Agentforce%20Specialist.png'
        },
        {
            isActive: false,
            id: 2,
            category: 'Data Cloud',
            name: 'Salesforce Certified Data Cloud Consultant',
            status: 'InActive',
            issued: 'Jul 2024',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20Data%20Cloud%20Consultant.png'
        },
        {
            isActive: true,
            id: 3,
            category: 'Experience Cloud',
            name: 'Salesforce Certified Experience Cloud Consultant',
            status: 'Active',
            issued: 'Aug 2025',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20Experience%20Cloud%20Consultant.png'
        },
        {
            isActive: true,
            id: 4,
            category: 'Salesforce Platform',
            name: 'Salesforce Certified Platform Administrator',
            status: 'Active',
            issued: 'Jan 2024',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20Platform%20Administrator.png'
        },
        {
            isActive: true,
            id: 5,
            category: 'Salesforce Platform',
            name: 'Salesforce Certified Platform Developer',
            status: 'Active',
            issued: 'May 2025',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20Platform%20Developer.png'
        },
        {
            isActive: true,
            id: 6,
            category: 'Salesforce Platform',
            name: 'Salesforce Certified JavaScript Developer',
            status: 'Active',
            issued: 'Feb 2026',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20JavaScript%20Developer.png'
        },
        {
            isActive: true,
            id: 7,
            category: 'Salesforce Platform',
            name: 'Process Automation Accredited Professional',
            status: 'Active',
            issued: 'Dec 2024',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Process%20Automation%20Accredited%20Professional.png'
        },
        {
            isActive: true,
            id: 8,
            category: 'Agentforce',
            name: 'Salesforce Certified AI Associate',
            status: 'Active',
            issued: 'Apr 2024',
            badgeUrl: 'https://raw.githubusercontent.com/NithyaNarayananV/LearningLWC/refs/heads/VS-Code/force-app/main/resume/resume_images/Salesforce%20Certified%20AI%20Associate.png'
        }
    ];


    skills = [
        { id: 1, name: 'Salesforce Apex, Triggers' },
        { id: 2, name: 'Lightning Flows' },
        { id: 3, name: 'Experience Cloud' },
        { id: 4, name: 'Custom Cloud' },
        { id: 5, name: 'Programming in Python, Java, C' },
        { id: 6, name: 'Query – SOQL, SQL' }
    ];

    socials = [
        { 
            id: 1, 
            name: 'LinkedIn.com/in/nithya-narayanan-c-vr-0278661aa/', 
            url: 'https://www.linkedin.com/in/nithya-narayanan-c-vr-0278661aa/' 
        },
        { 
            id: 2, 
            name: 'SalesForce.com/trailblazer/nithyanarayanancvr', 
            url: 'https://www.salesforce.com/trailblazer/nithyanarayanancvr' 
        },
        { 
            id: 3, 
            name: 'GitHub.com/NithyaNarayananV', 
            url: 'https://github.com/NithyaNarayananV' 
        }
    ];

    education = [
        { id: 1, year: '2018 – 2022', school: 'Rajalakshmi Institute of Technology', details: 'BE, Electrical and Electronics Engineering. Anna University. 85.3%' },
        { id: 2, year: '2016 – 2018', school: 'Shrine Vailankanni Senior Secondary School', details: '12th std (2018), Physics, Chemistry, Math, Computer Science. CBSE. 73%' },
        { id: 3, year: '2006 – 2016', school: 'Kendriya Vidyalaya CLRI', details: '10th std (2016), CBSE. 70%' }
    ];
    

    timeBreakdown;

    findTime() {
        const today = new Date();
        const targetDate = new Date("2023-01-30");

        let diffMs = today.getTime() - targetDate.getTime() ;

        // Convert to units
        const seconds = Math.floor(diffMs / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours   = Math.floor(minutes / 60);
        const days    = Math.floor(hours / 24);

        // Approximate months and years
        const years   = Math.floor(days / 365);
        const months  = Math.floor((days % 365) / 30); // rough estimate
        const remDays = days % 30;

        // Remaining hours/minutes/seconds after stripping days
        const remHours   = hours % 24;
        const remMinutes = minutes % 60;
        const remSeconds = seconds % 60;

        return {
            years,
            months,
            days: remDays,
            hours: remHours,
            minutes: remMinutes,
            seconds: remSeconds
        };
    }

    connectedCallback() {
        this.timeBreakdown = this.findTime();
        console.log('Breakdown:', this.timeBreakdown);
    }

    summaryPoints = [
        { id: 1, text: 'Over ${diffSeconds} of hands-on experience on the Salesforce platform, covering Apex, Flows, Triggers, administration, integration, and deployment.' },
        { id: 2, text: 'Salesforce Certified professional and Trailhead Ranger, reflecting platform expertise and a continuous learning attitude.' },
        { id: 3, text: 'Good understanding of Experience Cloud functionality.' },
        { id: 4, text: 'Proficient in Salesforce configuration  tools: Profiles, Permission Sets, Page Layouts, Record Types, and Custom Metadata.' },
        { id: 5, text: 'Good understanding of Salesforce security and access control features, including OWD, Role Hierarchy, Sharing Rules, and Permission Sets.' }
    ];

    expertisePoints = [
        { id: 1, text: 'Experienced in debugging Apex code, resolving deployment errors, and assisting with production issue troubleshooting and resolution.' },
        { id: 2, text: 'Collaborated with other Salesforce developers, QA testers, business analysts, and business users to support smooth deployments, validate new features, and assist in resolving bugs and enhancements.' },
        { id: 3, text: 'Communicate effectively in team settings, actively participating in discussions and supporting client-facing interactions, including time-sensitive issue resolution and presentations.' },
        { id: 4, text: 'Collaborative mindset, open to feedback & eager to contribute to shared goals.' },
        { id: 5, text: 'Detail-oriented and proactive in identifying issues, with a growing ability to troubleshoot and write maintainable code.' },
        { id: 6, text: 'Quick learner, capable of applying problem-solving techniques.' }
    ];

    techSkills = [
        { id: 1, category: 'Hands-On Experience', details: 'Salesforce Apex (Triggers, Classes), Lightning Web Components (Basic LWC – data binding, event handling, conditional rendering, custom forms, Apex integration), Salesforce Flows (record-triggered, screen flows), Security & Sharing (FLS, OLS, sharing rules), SOQL (relationship queries, governor limits), Testing & Deployment (unit tests, VS Code, SFDX CLI)' },
        { id: 2, category: 'Working Knowledge', details: 'Deployments - Hands-on with Git, GitHub, GitHub Actions and basic knowledge of Copado for managing deployments and release pipelines. Salesforce Experience Cloud, Reusability in Apex, Salesforce Integration. Data Loader, Salesforce Inspector, Workbench. ServiceNow.' },
        { id: 3, category: 'Basic Knowledge', details: 'Scrum ceremonies and JIRA. C, C++, Java, SQL, Microsoft Power Platform Automation' }
    ];

    experience = [
        { 
            id: 1, 
            company: 'Tata Consultancy Services', 
            duration: 'Jan 2023 – Present',
            roles: [
                {
                    title: 'Salesforce Developer',
                    points: [
                        '• Translated business requirements into scalable Salesforce solutions through close collaboration with internal and external stakeholders.',
                        '• Designed and developed Lightning Web Components (LWC) using wire adapters, input fields, data tables, navigation services, and Lightning Message Service (LMS) for dynamic user interfaces.',
                        '• Built robust Apex Classes, Triggers, Batch Apex, and Future Methods to handle complex logic and bulk data processing.',
                        '• Performed Apex callouts and REST API integrations to enable seamless data exchange with external systems.',
                        '• Queried and processed data using SOQL queries, handling record types & ensuring optimized performance within governor limits.',
                        '• Achieved high test coverage across Apex components to ensure deployment readiness and long-term code stability.',
                        '• Designed and deployed Apex-based automation for system health checks, reducing manual effort and enhancing audit efficiency.',
                        '• Executed end-to-end version control and CI/CD activities using GitHub and AutoRabit, including feature branching, pull requests, conflict resolution, and production deployments; trained in Copado fundamentals for release automation.',
                        '• Managed user access through Permission Sets, Profiles, Roles, and Sharing Rules to ensure compliant data visibility.',
                        '• Utilized Salesforce Inspector, Workbench, and Data Loader for efficient bulk operations and data maintenance.',
                        '• Collaborated in Agile sprint cycles, contributing to backlog grooming, daily stand-ups, and iterative delivery of user stories aligned with business priorities.'
                    ]
                }
            ]
        }
    ];

    sfProjects = [
        { 
            id: 1, 
            title: 'Cooperative Loan Management Application – Salesforce (Custom Build)', 
            year: '2025', 
            desc: 'Designed and implemented a custom Salesforce application to optimize Cooperative-based loan processing and expense tracking.',
            points: [
                'Loan Lifecycle Management: Designed and implemented Apex classes and Lightning Web Components (LWC) to handle loan creation, approval, servicing, and archiving, ensuring smooth transitions across the loan lifecycle.',
                //'Experience Cloud Development: Built and customized a Community Bank homepage using Experience Builder, delivering a mobile-friendly, accessible interface for external users to manage loan records.',
                'Automation & Flows: Developed complex Lightning Flows and approval processes to streamline loan operations, reducing manual intervention and improving efficiency.',
                'Integration & DevOps: Configured Salesforce DX project structure with CI/CD pipelines (GitHub Actions, Husky hooks, Prettier formatting, Jest testing) for automated validation and deployment.',
                'UI/UX Customization: Created culturally inclusive, multilingual, and responsive UI components to enhance user engagement and accessibility across devices.',
                'Testing & Quality Assurance: Implemented unit testing with Jest and enforced coding standards via Prettier and Git hooks, ensuring maintainable and high-quality code.',
                'Documentation & Collaboration: Authored user stories and technical documentation to align development with business requirements, supporting agile collaboration.'
            ]
        },
        { 
            id: 2, 
            title: 'Expense Tracker via Email Notification – Salesforce (Automation Project)', 
            year: '2024', 
            desc: 'Built an automated expense tracking solution using Salesforce to decode incoming bank emails and organize financial data intelligently.',
            points: [
                'Transaction Flow Automation: Designed and implemented Lightning Web Components (LWC) integrated with Screen Flows to streamline transaction processes, enabling guided user interactions and reducing manual errors.',
                'Salesforce DX Development: Structured the project using Salesforce DX (SFDX) with modular metadata, ensuring scalable deployments and version control.',
                'Apex & LWC Integration: Built Apex logic to handle transaction validations and record updates, seamlessly connected with LWC front-end components for real-time user feedback.',
                'DevOps & Quality Assurance: Configured GitHub workflows, Husky hooks, Prettier formatting, and Jest testing to enforce coding standards and automate validation during CI/CD pipelines.',
                'UI/UX Customization: Developed responsive, accessible transaction interfaces with HTML and JavaScript, ensuring compatibility across devices and enhancing user experience.',
                'Documentation & Collaboration: Authored README and configuration files to guide setup, deployment, and team collaboration, aligning development with Salesforce best practices.'
            ]
        }
    ];
    otherProjects = [
        { id: 1, title: 'Sudoku Solver - Python', year: '2023', desc: 'Designed and developed a Python-based Sudoku solver algorithm capable of solving grid-based logic puzzles programmatically using backtracking techniques.' },
        { id: 2, title: 'Basic Calculator App - Java', year: '2021', desc: 'Built a user-friendly Android application using Java that performs core arithmetic operations such as addition, subtraction, multiplication, and division.' },
        { id: 3, title: 'Online (Email) Shopping Mart Application - Java', year: '2020', desc: 'Designed and implemented a shopping and billing application in Java. Integrated email functionality to automatically send bill receipts to customers. Completed as part of college mini project requirements.' }
    ];
    /// Certificate HOVER PART
    @track isPopupVisible = false;

    showPopup() {
        this.isPopupVisible = true;
    }

    hidePopup() {
        // Delay slightly so user can move into popup
        setTimeout(() => {
            const popup = this.template.querySelector('.popup');
            if (!popup || !popup.matches(':hover')) {
                this.isPopupVisible = false;
            }
        }, 100);
    }

    keepPopup() {
        // Keeps popup visible while hovering inside
        this.isPopupVisible = true;
    }

    // CERTIFICATE HOVER END
}