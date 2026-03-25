import moment from 'moment';

export class ReadinessCalculator {
  static calculateSubjectReadiness(subject, studySessions, daysRemaining) {
    const totalTopics = subject.totalTopics || subject.topics?.length || 1;
    const completedTopics = subject.completedTopics || subject.topics?.filter(t => t.completed)?.length || 0;
    
    const completionScore = (completedTopics / totalTopics) * 100;
    const confidenceScore = this.calculateAverageConfidence(subject.topics);
    const studyConsistency = this.calculateStudyConsistency(studySessions);
    const timeScore = this.calculateTimeScore(daysRemaining, completionScore);
    
    const weights = {
      completion: 0.4,
      confidence: 0.3,
      consistency: 0.2,
      time: 0.1
    };

    const readinessScore = (
      completionScore * weights.completion +
      confidenceScore * weights.confidence +
      studyConsistency * weights.consistency +
      timeScore * weights.time
    );

    return {
      score: Math.round(readinessScore),
      breakdown: {
        completion: Math.round(completionScore),
        confidence: Math.round(confidenceScore),
        consistency: Math.round(studyConsistency),
        timeManagement: Math.round(timeScore)
      },
      status: this.getReadinessStatus(readinessScore)
    };
  }

  static calculateOverallReadiness(subjectReadiness, examWeightages) {
    let totalWeightedScore = 0;
    let totalWeight = 0;

    subjectReadiness.forEach((subject, index) => {
      const weight = examWeightages[index] || 1;
      totalWeightedScore += subject.score * weight;
      totalWeight += weight;
    });

    return Math.round(totalWeightedScore / totalWeight);
  }

  static calculateAverageConfidence(topics) {
    if (!topics || topics.length === 0) return 60;
    const totalConfidence = topics.reduce((sum, topic) => sum + (topic.confidence || 3), 0);
    return (totalConfidence / topics.length) * 20; // Convert 1-5 scale to 0-100
  }

  static calculateStudyConsistency(studySessions) {
    if (!studySessions || studySessions.length === 0) return 50;
    
    const last7Days = moment().subtract(7, 'days');
    const recentSessions = studySessions.filter(session => 
      moment(session.date).isAfter(last7Days)
    );

    const consistencyScore = (recentSessions.length / 7) * 100;
    return Math.min(consistencyScore, 100);
  }

  static calculateTimeScore(daysRemaining, completionPercentage) {
    if (daysRemaining <= 0) return completionPercentage;
    
    const idealCompletion = Math.max(20, 100 - (daysRemaining * 2));
    const timeScore = Math.min(100, (completionPercentage / idealCompletion) * 100);
    
    return isNaN(timeScore) || timeScore === Infinity ? 50 : Math.max(0, timeScore);
  }

  static getReadinessStatus(score) {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Average';
    if (score >= 40) return 'Needs Improvement';
    return 'Critical';
  }

  static detectBurnoutRisk(studySessions) {
    if (!studySessions || studySessions.length < 3) return { risk: 'Low', factors: [] };

    const recentSessions = studySessions.slice(-7);
    const avgFatigue = recentSessions.reduce((sum, s) => sum + (s.burnoutIndicators?.fatigue || 3), 0) / recentSessions.length;
    const avgMotivation = recentSessions.reduce((sum, s) => sum + (s.burnoutIndicators?.motivation || 3), 0) / recentSessions.length;
    const avgFocus = recentSessions.reduce((sum, s) => sum + (s.burnoutIndicators?.focus || 3), 0) / recentSessions.length;

    const factors = [];
    let riskLevel = 'Low';

    if (avgFatigue >= 4) factors.push('High fatigue levels');
    if (avgMotivation <= 2) factors.push('Low motivation');
    if (avgFocus <= 2) factors.push('Poor focus');

    if (factors.length >= 2) riskLevel = 'High';
    else if (factors.length === 1) riskLevel = 'Medium';

    return { risk: riskLevel, factors };
  }

  static generateRecommendations(readinessData, burnoutRisk, daysRemaining) {
    const recommendations = [];

    // Subject-specific recommendations
    readinessData.subjectWise.forEach(subject => {
      if (subject.score < 60) {
        recommendations.push(`Focus more on ${subject.name} - current readiness is low`);
      }
    });

    // Time-based recommendations
    if (daysRemaining <= 7 && readinessData.overall < 70) {
      recommendations.push('Intensive study mode recommended - exam is approaching');
    }

    // Burnout recommendations
    if (burnoutRisk.risk === 'High') {
      recommendations.push('Take regular breaks to avoid burnout');
      recommendations.push('Consider reducing study hours and focusing on quality');
    }

    return recommendations;
  }

  static simulateScenario(currentReadiness, additionalHours, focusSubjects, daysRemaining) {
    const improvementRate = 0.8; // 80% efficiency
    const safeDays = Math.max(daysRemaining, 1);
    const hoursPerDay = additionalHours / safeDays;
    
    let projectedScore = currentReadiness.overall || 50;
    
    // Calculate improvement based on additional study time
    const timeImprovement = Math.min(20, hoursPerDay * 2 * improvementRate);
    projectedScore += timeImprovement;

    // Bonus for focused study on weak subjects
    if (focusSubjects && focusSubjects.length > 0) {
      projectedScore += 5;
    }

    const improvement = Math.round(projectedScore - (currentReadiness.overall || 50));

    return {
      projectedScore: Math.min(100, Math.round(projectedScore)),
      improvement: Math.max(0, improvement),
      recommendations: this.generateScenarioRecommendations(hoursPerDay, focusSubjects)
    };
  }

  static generateScenarioRecommendations(hoursPerDay, focusSubjects) {
    const recommendations = [];
    
    if (hoursPerDay > 8) {
      recommendations.push('Consider reducing daily hours to avoid burnout');
    } else if (hoursPerDay < 2) {
      recommendations.push('Increase daily study time for better results');
    }

    if (focusSubjects && focusSubjects.length > 0) {
      recommendations.push(`Prioritize ${focusSubjects.join(', ')} for maximum impact`);
    }

    return recommendations;
  }
}