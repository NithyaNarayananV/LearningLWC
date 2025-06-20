public with sharing class koa {
    @AuraEnabled
    public static String getAgentResponse(String userPrompt, String sessionId) {
        Invocable.Action action = Invocable.Action.createCustomAction('generateAiAgentResponse', 'Agentforce_Koa_Cars');
        action.setInvocationParameter('userMessage', userPrompt);
        if (sessionId != null) {
            action.setInvocationParameter('sessionId', sessionId);
        }
        List<Invocable.Action.Result> results = action.invoke();
        if (!results.isEmpty()) {
            return (String) results[0].getOutputParameters().get('response');
        }
        return 'No response from Agentforce.';
    }
}