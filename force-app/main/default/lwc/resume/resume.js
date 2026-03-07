import { LightningElement } from 'lwc';

export default class Resume extends LightningElement {
    name = 'C VR Nithya Narayanan';
    title = 'Salesforce Developer';
    email = 'nithyanarayanancvr@gmail.com';
    linkedin = 'https://linkedin.com/in/nithya-narayanan-c-vr-0278661aa/';
    github = 'https://github.com/NithyaNarayananV';

    objective = 'Salesforce Developer with 3 years of experience building scalable, user-centric solutions using Apex, LWC, and Lightning Flows. Passionate about delivering high-impact applications that support digital transformation in fast-paced, collaborative environments.';

    careerSummary = [
        '3 years of hands-on experience designing and deploying Salesforce solutions using Apex, LWC, and Lightning Flows.',
        'Proficient in Apex Triggers, Batch Apex, Future Methods, and REST API integrations.',
        'Skilled in GitHub and AutoRabit for version control, CI/CD, and collaborative development.',
        'Strong analytical skills with ability to translate complex business requirements into solutions.',
        'Effective communicator with stakeholder collaboration and agile delivery experience.'
    ];

    skills = [
        { category: 'Core Salesforce Skills', items: 'Apex (Triggers, Classes, Batch, Future), LWC, Lightning Flows, SOQL/SOSL, Security & Sharing, Experience Cloud, Unit Testing, Deployment (VS Code, SFDX CLI)' },
        { category: 'DevOps & Tools', items: 'Git, GitHub, AutoRabit, Copado (basic), Salesforce Inspector, Workbench, Data Loader, Lightning Studio' },
        { category: 'Additional Technologies', items: 'C, Python, Java, SQL, Power Platform Automation, ServiceNow, Jira' }
    ];

    experience = [
        {
            id: 1,
            company: 'Tata Consultancy Services',
            role: 'Salesforce Developer',
            period: 'Jan 2023 – Present',
            details: [
                'Translated business requirements into scalable Salesforce solutions.',
                'Developed Lightning Web Components with wire adapters, input fields, data tables, and LMS.',
                'Built Apex Classes, Triggers, Batch Apex, and Future Methods for complex logic.',
                'Performed REST API integrations and Apex callouts.',
                'Ensured optimized performance with SOQL queries and governor limits.',
                'Achieved high test coverage across Apex components.',
                'Managed user access with Permission Sets, Profiles, Roles, and Sharing Rules.',
                'Executed CI/CD with GitHub and AutoRabit, trained in Copado fundamentals.',
                'Used Salesforce Inspector, Workbench, and Data Loader for bulk operations.',
                'Designed Apex-based automation for system health checks.',
                'Collaborated in Agile sprint cycles for iterative delivery.'
            ]
        }
    ];

    certifications = [
        'Salesforce Certified Administrator',
        'Salesforce Certified Platform Developer 1',
        'Salesforce Certified Experience Cloud Consultant',
        'Salesforce Certified Agentforce Specialist',
        'Salesforce Certified JavaScript Developer',
        'Process Automation Accredited Professional',
        'AutoRABIT DevOps Beginner'
    ];

    education = {
        degree: 'Bachelor of Engineering in Electrical and Electronics Engineering',
        institution: 'Rajalakshmi Institute of Technology | Anna University',
        year: '2018–2022',
        percentage: '85.3%'
    };
}