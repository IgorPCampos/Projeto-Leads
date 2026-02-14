const API_BASE_URL = "http://localhost:3000";

interface IntentionResponse {
  id: string;
}

interface LeadResponse {
  id: string;
}

export const api = {
  createIntention: async (
    zipcodeStart: string,
    zipcodeEnd: string,
  ): Promise<IntentionResponse> => {
    const cleanStart = zipcodeStart.replace(/\D/g, "");
    const cleanEnd = zipcodeEnd.replace(/\D/g, "");

    const response = await fetch(`${API_BASE_URL}/intention`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        zipcode_start: cleanStart,
        zipcode_end: cleanEnd,
      }),
    });

    if (!response.ok) throw new Error("Falha ao criar intenção");
    return response.json();
  },

  createLead: async (name: string, email: string): Promise<LeadResponse> => {
    const response = await fetch(`${API_BASE_URL}/lead`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email }),
    });

    if (!response.ok) throw new Error("Falha ao cadastrar lead");
    return response.json();
  },

  associateLeadToIntention: async (
    intentionId: string,
    leadId: string,
  ): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/intention/${intentionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lead_id: leadId }),
    });

    if (!response.ok) throw new Error("Falha ao associar lead à intenção");
  },
};
