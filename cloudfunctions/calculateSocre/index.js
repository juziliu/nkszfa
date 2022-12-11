// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init()
const db = cloud.database();

const getMatchScore = (resObj, quizMap) => {
  const { teamA: resA, teamB: resB, gameId } = resObj;
  const teamAIndex = `${gameId}teamA`;
  const teamBIndex = `${gameId}teamB`;
  const quizA = quizMap[teamAIndex];
  const quizB = quizMap[teamBIndex];

  if (quizA === resA && quizB === resB) {
    return 2;
  }

  if (quizA === quizB && resA === resB) {
    return 1;
  }

  if (quizA > quizB && resA > resB) {
    return 1;
  }

  if (quizA < quizB && resA < resB) {
    return 1;
  }

  return 0;
}

const getRoundScore = (result, quiz, round) => {
  const resultList = JSON.parse(result.result);
  const quizMap = JSON.parse(quiz);

  console.log(resultList, quizMap);

  let roundScore = 0;

  resultList.forEach((resultItem, index) => {
    const matchScore = getMatchScore(resultItem, quizMap);
    roundScore += matchScore;
    if (matchScore > 0 && round > 8) {
      roundScore += 1;
    }
  });

  return roundScore;
};

// 云函数入口函数
exports.main = async (event, context) => {
  const { data: users } = await db.collection('user').get();
  const { data: gameResult } = await db.collection('gameResult').get();
  const userScoreList = [];

  console.log('useList', users);
  console.log('gameList', gameResult);

  const userPromiseMap = users.map(async user => {
    const { openid, realName, avatarUrl } = user;
    if (realName) {
      let score = 0;
      const { data: userQuizList } = await db.collection('quiz').where({ userId: openid }).get();
      console.log('now is', realName, userQuizList);
      userQuizList.forEach(userQuiz => {
        const { round, quizMap } = userQuiz;
        console.log('round is ', round);
        if (round < 15) {
          score += getRoundScore(gameResult[round - 1], quizMap, round);
          console.log('round score is', score);
        }
      });
      console.log(realName, 'finish ', score);
      userScoreList.push({
        realName,
        avatarUrl,
        score,
        userId: openid,
      });
      return true;
    }
  });

  Promise.all(userPromiseMap).then(() => {
    userScoreList.sort((itemA, itemB) => {
      return itemB.score - itemA.score;
    });
    console.log('userScoreList', JSON.stringify(userScoreList));
  })

  return {
  }
}