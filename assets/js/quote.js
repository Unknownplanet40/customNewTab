export const quotes = [
  "Believe you can and you're halfway there.",
  "Act as if what you do makes a difference. It does.",
  "Success is not final, failure is not fatal: it is the courage to continue that counts.",
  "Never bend your head. Always hold it high. Look the world straight in the eye.",
  "What you get by achieving your goals is not as important as what you become by achieving your goals.",
  "You do not find the happy life. You make it.",
  "Stay close to anything that makes you glad you are alive.",
  "Make each day your masterpiece.",
  "Happiness is not by chance, but by choice.",
  "The only limit to our realization of tomorrow will be our doubts of today.",
  "It is what it is.",
  "Trust the process.",
  "Every wait has a worth.",
  "Just because you love the ocean, doesn't mean you have to drown in it.",
  "Take one step at a time. That's all it takes.",
  "The best way to predict the future is to create it.",
  "Small steps every day lead to massive results.",
  "Your only limit is the one you set for yourself.",
  "Turn your wounds into wisdom.",
  "Discipline is choosing between what you want now and what you want most.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Growth begins at the end of your comfort zone.",
  "Be the energy you want to attract.",
  "Progress, not perfection.",
  "You are stronger than you think.",
  "Every champion was once a contender who refused to give up.",
  "The pain of discipline is nothing compared to the pain of regret.",
  "Fall seven times, stand up eight.",
  "Your mindset determines your success.",
  "Don't wait for opportunity. Create it.",
  "Consistency beats intensity every time.",
  "You didn't come this far to only come this far.",
  "Be a warrior, not a worrier.",
  "The sun always rises after the darkest night.",
  "What you focus on expands.",
  "Dream big, work hard, stay focused.",
  "You are the author of your own story.",
  "Courage is resistance to fear, mastery of fear — not absence of fear.",
  "Stay patient and trust your journey.",
  "The only impossible journey is the one you never begin.",
  "Kindness is free. Sprinkle that stuff everywhere.",
  "Bloom where you are planted.",
  "In the middle of difficulty lies opportunity.",
  "Don't downgrade your dream just to fit your reality.",
  "You are capable of more than you know.",
  "Let your faith be bigger than your fear.",
  "Great things never come from comfort zones.",
  "The secret of getting ahead is getting started.",
  "Don't stop until you're proud.",
  "Everything you need is already inside you.",
  "Rise above the storm and you will find the sunshine.",
  "Believe in yourself and anything is possible.",
  "The best revenge is massive success.",
  "Stay hungry, stay foolish.",
  "Your future is created by what you do today.",
  "Keep going. You're closer than you think.",
  "Hustle until your haters ask if you're hiring.",
  "Success is a series of small wins.",
  "Be the person your dog thinks you are.",
  "Don't count the days, make the days count.",
  "Obstacles are opportunities in disguise.",
  "You become what you believe.",
  "Stay true to yourself.",
  "The grind never stops.",
  "One day or day one. You choose.",
  "Positive mind, positive vibes, positive life.",
  "Embrace the glorious mess that you are.",
  "You are enough just as you are.",
  "The best is yet to come.",
  "Keep your head high and your standards higher.",
  "Do it with passion or not at all.",
  "Silence is the best answer to a fool.",
  "Energy flows where attention goes.",
  "Chase your dreams, not people.",
  "Be so good they can't ignore you.",
  "Life is tough, but so are you.",
  "Doubt kills more dreams than failure ever will.",
  "You got this.",
  "Strive for progress, not perfection.",
  "The comeback is always stronger than the setback.",
  "Winners never quit and quitters never win.",
  "Make today so awesome that yesterday gets jealous.",
  "Your vibe attracts your tribe.",
  "Stay focused and never give up.",
  "Difficult roads often lead to beautiful destinations.",
  "Success doesn't come to you, you go to it.",
  "Be the change you wish to see in the world.",
  "Don't fear failure. Fear being in the exact same place next year.",
  "You are your only limit.",
  "Gratitude turns what we have into enough.",
  "The only way out is through.",
  "Keep moving forward.",
  "Every accomplishment starts with the decision to try.",
  "Don't let yesterday take up too much of today.",
  "You are built for this.",
  "Stars can't shine without darkness.",
  "Do what is right, not what is easy.",
  "The moment you give up is the moment you let someone else win.",
  "Create the life you can't wait to wake up to.",
  "Be fearless in the pursuit of what sets your soul on fire.",
  "A year from now you'll wish you started today.",
  "You didn't survive everything just to quit now.",
  "Stay humble. Work hard. Be kind.",
  "The future belongs to those who believe in the beauty of their dreams.",
  "Don't compare your chapter one to someone else's chapter twenty.",
  "You are magic.",
  "Keep calm and keep grinding.",
  "Your potential is endless.",
  "Train your mind to see the good in every situation.",
  "The only bad workout is the one that didn't happen.",
  "Courage doesn't always roar. Sometimes it's the quiet voice saying 'I will try again tomorrow.'",
  "Be the reason someone smiles today.",
  "Life is short. Make it sweet.",
  "What you think, you become.",
  "Nothing worth having comes easy.",
  "You are exactly where you need to be.",
  "Shine bright like the star you are.",
  "Every day is a new chance to change your life."
];

export function initQuoteController(useOnline = false, typeOfEntertainment = "quotes", customApiKey = "") {
  const $quoteText = $("#quoteText");
  let isErrorOccured = false;
  const sessionlimit = 10;
  let sessionCount = 0;
  if (!$quoteText.length) return;

  const defaultApiKey = "[YOUR_API_KEY_HERE]";
  const apiKey = customApiKey && customApiKey.trim() !== "" ? customApiKey.trim() : defaultApiKey;

  function fetchFromApi(type) {
    const urlMap = {
      quotes: "https://api.api-ninjas.com/v1/quotes",
      joke: "https://api.api-ninjas.com/v1/jokes",
      riddle: "https://api.api-ninjas.com/v1/riddles",
      fact: "https://api.api-ninjas.com/v1/facts",
    };
    const url = urlMap[type] || urlMap["quotes"];

    return $.ajax({
      method: "GET",
      url: url,
      headers: { "X-Api-Key": apiKey },
    });
  }

  function formatResponse(type, data) {
    if (!data || data.length === 0) return "No content found.";
    const item = data[0];
    switch (type) {
      case "quotes":
        return `<span class="quote-content">"${item.quote}"</span><br><small class="quote-author text-white-50" style="font-size: 0.85em;">- ${item.author}</small>`;
      case "joke":
        return `<span class="joke-text">${item.joke}</span>`;
      case "riddle":
        return `<div class="riddle-q fw-bold">Q: ${item.question}</div><div class="riddle-a text-white-50 mt-1" style="font-size: 0.9em;">A: ${item.answer}</div>`;
      case "fact":
        return `<div class="fact-text"><strong class="text-white-50">Did you know?</strong><br>${item.fact}</div>`;
      default:
        return item.quote || item.joke || item.fact || "Unknown type";
    }
  }

  function setContent() {
    if (useOnline) {
      $(".loader").removeClass("d-none");

      fetchFromApi(typeOfEntertainment)
        .done(function (response) {
          $(".loader").addClass("d-none");
          const htmlContent = formatResponse(typeOfEntertainment, response);
          $quoteText.fadeOut(400, function () {
            $(this).html(htmlContent).fadeIn(400);
          });
          isErrorOccured = false;
          if (sessionCount < sessionlimit) {
            sessionCount++;
          }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
          $(".loader").addClass("d-none");
          if (jqXHR.status >= 400 && jqXHR.status < 500) {
            const errorMsg = jqXHR.responseJSON && jqXHR.responseJSON.error ? jqXHR.responseJSON.error : "API Limit Exceeded or Invalid Key.";

            const htmlContent = `<span class="text-danger" style="font-size: 0.9em;"><i class="bi bi-exclamation-triangle-fill me-1"></i> ${errorMsg}</span>`;
            isErrorOccured = true;
            sessionCount = sessionlimit;
            $quoteText.fadeOut(400, function () {
              $(this).html(htmlContent).fadeIn(400);
            });
          } else {
            fallbackToOffline();
          }
        });
    } else {
      fallbackToOffline();
    }
  }

  function fallbackToOffline() {
    const randomIndex = Math.floor(Math.random() * quotes.length);
    const selectedQuote = quotes[randomIndex];
    $quoteText.fadeOut(400, function () {
      $(this).html(`"${selectedQuote}"`).fadeIn(400);
    });
  }

  setContent();

  if (sessionCount < sessionlimit && !isErrorOccured) {
    setInterval(setContent, 300000);
  } else {
    setTimeout(() => {
      isErrorOccured = false;
      sessionCount = 0;
      setContent();
    }, 300000);
  }
}
