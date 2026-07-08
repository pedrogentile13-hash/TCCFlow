// ============================================================
// TCCFlow - Pricing Configuration (Single Source of Truth)
// ============================================================
// All prices in BRL (R$). Update here and all pages reflect changes.
// ============================================================

const PRICING = {
    BASE_PRICE: 97,          // Base annual price for PRO plan (1 seat)
    SEAT_PRICE: 30,          // Additional cost per extra seat/year
    MAX_SEATS: 8,            // Maximum seats per plan
    FREE_AI_SEARCHES: 20,    // Free plan AI searches/month
    PRO_AI_SEARCHES: 1000,   // PRO plan AI searches/month
    FREE_PROJECTS: 1,        // Free plan max projects
    PRO_PROJECTS: 2,         // PRO plan max projects

    // Competitor comparison prices (for marketing page)
    COMPETITORS: {
        googleWorkspace: 336,
        trelloAsana: 600,
        aiTools: 480,
        notionMonday: 384
    },

    // Formatted helpers
    get monthlyEquivalent() {
        return (this.BASE_PRICE / 12).toFixed(2).replace('.', ',');
    },
    get competitorTotal() {
        return Object.values(this.COMPETITORS).reduce((a, b) => a + b, 0);
    },
    get savings() {
        return this.competitorTotal - this.BASE_PRICE;
    },

    formatBRL(value) {
        return `R$ ${value}`;
    },
    formatBRLDecimal(value) {
        return `R$ ${Number(value).toFixed(2).replace('.', ',')}`;
    }
};
