export class EnergyFunction {
    constructor() {
        this.value = 0.3;
        this.alpha = 0.1;
        this.history = [];
        this.maxPoints = 120;
    }

    async getSignals() {
        const [climate, sentiment, conflict] = await Promise.all([
            fetch('https://global-warming.org/api/temperature-api')
                .then(r => r.json())
                .then(d => d.result?.slice(-1)[0]?.station || 0)
                .catch(() => 0.5),

            fetch('https://api.gdeltproject.org/api/v2/doc/doc?query=climate&mode=artlist&format=json')
                .then(r => r.json())
                .then(d => d.articles?.length / 50 || 0)
                .catch(() => 0.5),

            fetch('https://acleddata.com/wp-content/uploads/2023/01/acled_api_conflict_sample.json')
                .then(r => r.json())
                .then(d => d.data?.length / 100 || 0)
                .catch(() => 0.5)
        ]);

        return {
            climate: Math.min(climate / 2, 1),
            sentiment: Math.min(sentiment, 1),
            conflict: Math.min(conflict, 1)
        };
    }

    async compute() {
        const signals = await this.getSignals();

        const S =
            0.5 * signals.climate +
            0.3 * signals.conflict +
            0.2 * signals.sentiment;

        this.value = this.alpha * S + (1 - this.alpha) * this.value;

        this.history.push(this.value);
        if (this.history.length > this.maxPoints) {
            this.history.shift();
        }

        return this.value;
    }
}
