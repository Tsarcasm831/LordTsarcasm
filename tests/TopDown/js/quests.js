export class QuestSystem {
  constructor() {
    this.activeQuests = [
      {
        id: 'first_gather',
        title: 'Gather Resources',
        description: 'Collect 5 Wood and 3 Stone',
        progress: { wood: 0, stone: 0 },
        required: { wood: 5, stone: 3 },
        reward: { gold: 100 },
        completed: false
      }
    ];
  }

  updateProgress(item, quantity) {
    this.activeQuests.forEach(quest => {
      if (!quest.completed && quest.progress[item] !== undefined) {
        quest.progress[item] += quantity;
        if (quest.progress[item] >= quest.required[item]) {
          this.checkCompletion(quest);
        }
      }
    });
  }

  checkCompletion(quest) {
    if (Object.entries(quest.required).every(([item, req]) => 
      quest.progress[item] >= req
    )) {
      quest.completed = true;
      return true;
    }
    return false;
  }
}