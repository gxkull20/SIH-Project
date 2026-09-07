export interface OptionExplanation {
  label: string;
  complianceType: "safe" | "suspicious" | "compromised" | "normal";
  shortBadge: string;
  threatImpact: string;
  fullExplanation: string;
  psychologicalMechanism: string;
  attackerNextMove: string;
  regulatoryDirective: string;
}

export interface TurnExplanation {
  questionId: string;
  questionTitle: string;
  attackVector: string;
  pretext: string;
  psychologicalHook: string;
  redFlags: string[];
  options: OptionExplanation[];
}

export const SCENARIO_EXPLANATIONS: Record<string, Record<string, TurnExplanation>> = {
  bank_kyc_otp_fraud: {
    turn_1: {
      questionId: "turn_1",
      questionTitle: "Question 1: The Fake Emergency Trap",
      attackVector: "Fake Alert About a Stolen Transaction",
      pretext: "The caller claims to be from Demo Bank and says Rs. 48,990 was just spent on your card in Singapore.",
      psychologicalHook:
        "The caller wants you to panic. By saying a large amount of money was just spent in another country, they hope you get scared and stop thinking clearly.",
      redFlags: [
        "The bank does not call you out of nowhere asking you to verbally cancel charges.",
        "The computer detected an 86% chance this is an artificial robot/AI voice.",
        "The caller claims to be from 'Delhi', but this bank has no branch in Delhi.",
        "The call is coming from a regular mobile number, not an official bank phone line.",
      ],
      options: [
        {
          label: "No, I did not authorize this! Cancel it immediately.",
          complianceType: "compromised",
          shortBadge: "🚨 Dangerous · Panic Trap",
          threatImpact: "High Risk · Walked into scammer's trap",
          fullExplanation:
            "This response is dangerous because it shows the scammer that you are panicked. When you say 'Cancel it immediately!', you are trusting the caller to fix the problem. The scammer's very next step will be to ask for an OTP or password under the excuse of 'canceling' the fake charge.",
          psychologicalMechanism:
            "Showing fear: The scammer now knows you are scared and will follow their instructions to save your money.",
          attackerNextMove:
            "The scammer will say: 'Okay, I will reverse the charge. Just tell me the 6-digit cancellation code I sent to your phone.'",
          regulatoryDirective:
            "Golden Rule: Real banks never ask you to cancel a charge over an unexpected phone call.",
        },
        {
          label: "Which branch are you calling from? What is your employee ID?",
          complianceType: "suspicious",
          shortBadge: "⚠️ Helpful · Questions the Caller",
          threatImpact: "Medium Risk · Slows the scammer down",
          fullExplanation:
            "This is a smart move because you are testing the caller. You are not blindly trusting them. However, smart scammers will simply invent a fake employee ID (like 'Badge EMP-9921') and start shouting that you are wasting time while your money is being stolen.",
          psychologicalMechanism:
            "Challenging authority: You are slowing the scammer down, but they will try to intimidate you.",
          attackerNextMove:
            "The scammer will make up a fake ID and get angry: 'There is no time for questions! Your money will be lost in 2 minutes!'",
          regulatoryDirective:
            "Tip: Never trust an employee ID given over the phone. Anyone can make up a number.",
        },
        {
          label: "I will call the customer care number on the back of my card directly.",
          complianceType: "safe",
          shortBadge: "✅ 100% Safe · The Best Defense",
          threatImpact: "Safe · Scam Stopped Instantly",
          fullExplanation:
            "This is the safest and best thing you can do. You refuse to talk to someone who called you uninvited. Instead, you hang up and call the official bank number printed on the back of your ATM card. The scammer cannot listen in or steal anything when you do this.",
          psychologicalMechanism:
            "Taking control: You stop the call and go directly to trusted official sources.",
          attackerNextMove:
            "The scammer will try to stop you from hanging up, and then disconnect when they realize you won't fall for it.",
          regulatoryDirective:
            "RBI Rule: Always hang up and call the number on the back of your ATM card or passbook.",
        },
      ],
    },
    turn_2a: {
      questionId: "turn_2a",
      questionTitle: "Question 2: The OTP Stealing Trick",
      attackVector: "Calling the OTP a 'Cancellation Code'",
      pretext: "The caller claims they sent a 'cancellation code' to stop the charge and wants you to read the 6 digits aloud.",
      psychologicalHook:
        "The scammer knows people are told 'never share your OTP'. So they trick you by calling it a 'cancellation code' or 'refund number' instead of an OTP.",
      redFlags: [
        "Asking for numbers that just arrived on your SMS.",
        "Saying you only have 3 minutes so you don't have time to read the text message.",
        "The SMS message clearly says 'OTP for purchase of Rs. 48,990', which proves they are trying to steal your money.",
      ],
      options: [
        {
          label: "Okay, the OTP is 849201. Please reverse it fast!",
          complianceType: "compromised",
          shortBadge: "🚨 Money Stolen · Critical Mistake",
          threatImpact: "100/100 Risk · Account Emptied",
          fullExplanation:
            "You gave away your secret OTP password. The scammer types these digits into a shopping website or money transfer app right away. Rs. 48,990 will be instantly deducted from your bank account and cannot easily be recovered.",
          psychologicalMechanism:
            "Giving the secret key: You trusted the scammer and gave away the single password protecting your money.",
          attackerNextMove:
            "The scammer takes the money, hangs up immediately, and switches off their phone.",
          regulatoryDirective:
            "Strict Rule: Bank staff NEVER ask for an OTP. If you share an OTP, the bank cannot easily refund your money.",
        },
        {
          label: "My bank says never share OTPs with anyone on call.",
          complianceType: "suspicious",
          shortBadge: "⚠️ Good Pushback · But Still on Call",
          threatImpact: "Medium Risk · Scammer will argue with you",
          fullExplanation:
            "You remembered the most important rule: never share an OTP! That is great. But because you are still talking to the scammer, they will start arguing that 'This is NOT an OTP, this is a cancellation code!' to confuse you.",
          psychologicalMechanism:
            "Resisting: You know something is wrong, but you are letting the scammer argue with you.",
          attackerNextMove:
            "The scammer will shout: 'Sir, this is NOT an OTP! If you don't read it, you will lose your 48,000 rupees!'",
          regulatoryDirective:
            "Safety Step: Don't argue with them. As soon as anyone asks for an OTP, hang up immediately.",
        },
        {
          label: "I am terminating this call and reporting this to 1930 Cyber Cell.",
          complianceType: "safe",
          shortBadge: "✅ Perfect Action · Reported Scam",
          threatImpact: "0/100 Risk · Completely Protected",
          fullExplanation:
            "The absolute best response. You hang up and mention 1930 (the official Indian Cyber Crime helpline). Scammers get terrified when victims mention police reporting and hang up immediately.",
          psychologicalMechanism:
            "Turning the tables: You scare the criminal by mentioning the real police helpline.",
          attackerNextMove:
            "The scammer hangs up immediately and deletes their temporary number.",
          regulatoryDirective:
            "Government Helpline: Call 1930 or visit cybercrime.gov.in to report cyber frauds.",
        },
      ],
    },
    turn_2b: {
      questionId: "turn_2b",
      questionTitle: "Question 2: The Bullying & Shouting Tactic",
      attackVector: "Scammer Starts Yelling and Blaming You",
      pretext: "The scammer invents a fake badge ID ('EMP-9921') and yells that your money will vanish in 2 minutes if you keep arguing.",
      psychologicalHook:
        "Bullying and Fear: When polite tricks fail, scammers start shouting to make you feel guilty and rushed so you obey them.",
      redFlags: [
        "Bank employees are never allowed to shout or threaten customers.",
        "Rushing you with a 2-minute countdown.",
        "Refusing to let you check with your local branch.",
      ],
      options: [
        {
          label: "Fine, the OTP is 849201! Stop the charge!",
          complianceType: "compromised",
          shortBadge: "🚨 Bullied into Surrender",
          threatImpact: "100/100 Risk · Money Stolen",
          fullExplanation:
            "The user gave up because of the shouting and pressure. Scammers yell on purpose so you stop thinking. Giving the OTP means your money is gone.",
          psychologicalMechanism:
            "Panic surrender: You just wanted the shouting and stress to stop, but gave away your savings.",
          attackerNextMove:
            "Money stolen instantly; call disconnected.",
          regulatoryDirective:
            "Remember: Real bank officers never scream, threaten, or rush you.",
        },
        {
          label: "Your branch info does not match the bank directory. I am hanging up.",
          complianceType: "safe",
          shortBadge: "✅ Caught in a Lie · Safe Hangup",
          threatImpact: "0/100 Risk · Scammer Defeated",
          fullExplanation:
            "You used the facts to catch the scammer in a lie. VoiceShield already showed that Demo Bank has no Delhi branch. You called out their fake branch and hung up safely.",
          psychologicalMechanism:
            "Using facts: You caught the liar and refused to listen to their shouting.",
          attackerNextMove:
            "The scammer realizes they are caught and hangs up.",
          regulatoryDirective:
            "Rule: If a caller gives fake branch information, hang up right away.",
        },
      ],
    },
    turn_caller_pressure: {
      questionId: "turn_caller_pressure",
      questionTitle: "Question 3: Final Desperation Attempt",
      attackVector: "Confusing Words to Steal Code",
      pretext: "The scammer desperately claims this code is legally required to protect you from liability.",
      psychologicalHook:
        "Confusion: Trying to make you doubt your own common sense.",
      redFlags: [
        "Still begging for the 6 digits.",
        "Claiming the bank won't protect you if you don't give the code.",
      ],
      options: [
        {
          label: "I will never share an OTP. Goodbye.",
          complianceType: "safe",
          shortBadge: "✅ Iron Defense · Total Win",
          threatImpact: "0/100 Risk · Fully Protected",
          fullExplanation:
            "Clear and firm. You refused to be confused by word games and ended the call. Your money is completely safe.",
          psychologicalMechanism:
            "Standing firm: No matter what the scammer said, you protected your secret OTP.",
          attackerNextMove:
            "Scammer gives up completely.",
          regulatoryDirective:
            "Golden Rule: Never share an OTP with anyone, ever.",
        },
        {
          label: "Alright fine, it is 849201.",
          complianceType: "compromised",
          shortBadge: "🚨 Gave Up at the End",
          threatImpact: "100/100 Risk · Money Lost",
          fullExplanation:
            "You defended yourself for a long time, but finally gave in at the very end because you were tired. The scammer gets the money anyway.",
          psychologicalMechanism:
            "Tiredness: The scammer wore you down until you gave up.",
          attackerNextMove:
            "The scammer steals the money immediately.",
          regulatoryDirective:
            "Stay strong until the end. If you feel tired or confused, just press the red hangup button!",
        },
      ],
    },
  },
  customs_police_extortion: {
    turn_1: {
      questionId: "turn_1",
      questionTitle: "Question 1: The 'Digital Arrest' Police Threat",
      attackVector: "Fake Police & Drugs in Parcel Threat",
      pretext: "Caller pretends to be Police Inspector Vikramaditya and claims 5 fake passports and drugs were found under your Aadhaar.",
      psychologicalHook:
        "Pure Terror: Threatening an innocent person with arrest for drugs to make them so frightened they do anything the caller asks.",
      redFlags: [
        "Police NEVER issue arrest warrants over a phone call.",
        "There is no such thing as a 'Digital Arrest' under Indian Law.",
        "Voice is 82% likely to be an AI robot voice.",
      ],
      options: [
        {
          label: "Sir, I have never sent any parcel! My Aadhaar must have been misused!",
          complianceType: "compromised",
          shortBadge: "🚨 Panicked Pleading · Trap Started",
          threatImpact: "High Risk · Falling for extortion",
          fullExplanation:
            "By pleading innocence to a stranger on the phone, you accept their fake authority. The scammer will now pretend to 'help' you by offering a fake online settlement.",
          psychologicalMechanism:
            "Fear obedience: You are trying to convince a criminal that you are innocent.",
          attackerNextMove:
            "The scammer will say: 'Okay, we can put you under virtual custody on Skype so police don't come to your house.'",
          regulatoryDirective:
            "Police Rule: Indian police never conduct investigations or arrest people over phone/video calls.",
        },
        {
          label: "I will report directly to my local police station to verify this warrant.",
          complianceType: "safe",
          shortBadge: "✅ Infallible Defense · Real Police Check",
          threatImpact: "0/100 Risk · Scam Destroyed",
          fullExplanation:
            "Real police warrants can only be served in person at your local police station. Fake scammers can never show up at a real police station.",
          psychologicalMechanism:
            "Reality check: Asking for real, physical police immediately scares off online extortionists.",
          attackerNextMove:
            "Scammer tries to threaten you not to leave the house, then hangs up.",
          regulatoryDirective:
            "Government Directive: If someone threatens you with 'digital arrest', hang up and dial 1930.",
        },
      ],
    },
    turn_2a: {
      questionId: "turn_2a",
      questionTitle: "Question 2: Demanding Money for a 'Refundable Bond'",
      attackVector: "Demanding 50,000 INR to Avoid Fake Arrest",
      pretext: "Caller tells you to transfer Rs. 50,000 to a 'safe government account' to clear your name.",
      psychologicalHook:
        "Extortion: Saying the money is 'refundable' makes you think you will get it back after you are cleared.",
      redFlags: [
        "Police and judges NEVER ask for money transfers over UPI or phone.",
        "No government department asks you to send money to a personal bank account.",
      ],
      options: [
        {
          label: "Police never request money transfers over the phone. Hanging up now.",
          complianceType: "safe",
          shortBadge: "✅ Total Victory · Scam Shut Down",
          threatImpact: "0/100 Risk · Completely Safe",
          fullExplanation:
            "You called out the big lie. Police and judges never accept bail or bonds through phone UPI transfers.",
          psychologicalMechanism:
            "Common sense: Knowing the law protects you from fear.",
          attackerNextMove:
            "Scammer hangs up immediately.",
          regulatoryDirective:
            "Supreme Court Order: 'Digital arrest' is completely illegal. Never send money.",
        },
        {
          label: "Okay, where do I send the verification deposit?",
          complianceType: "compromised",
          shortBadge: "🚨 Extortion Trap · Money Gone",
          threatImpact: "100/100 Risk · Total Loss",
          fullExplanation:
            "You agreed to send Rs. 50,000 to a criminal. Once sent, the money is gone forever, and they will demand another 1 lakh rupees next.",
          psychologicalMechanism:
            "Fear of arrest: Terrified of going to jail, so you sent money to a criminal.",
          attackerNextMove:
            "Takes the Rs. 50,000 and demands another Rs. 1,00,000 for 'clearance fees'.",
          regulatoryDirective:
            "Contact your bank immediately to freeze the transfer and report to cybercrime.gov.in.",
        },
      ],
    },
  },
  legitimate_bank_verification: {
    turn_1: {
      questionId: "turn_1",
      questionTitle: "Question 1: Real Bank Call (Normal)",
      attackVector: "Routine Customer Service Check",
      pretext: "Real Demo Bank employee asking if you submitted an address update yesterday.",
      psychologicalHook:
        "Polite, calm, and respectful. No threats, no rushing, and no asking for secret codes.",
      redFlags: [
        "No red flags! This is what a real bank call sounds like.",
        "Voice is 92% human, not an AI robot.",
        "The representative explicitly reminds you: 'We will never ask for your confidential password or OTP.'",
      ],
      options: [
        {
          label: "Yes, I submitted that update request yesterday.",
          complianceType: "normal",
          shortBadge: "✅ Normal Confirmation",
          threatImpact: "0/100 Risk · Completely Safe",
          fullExplanation:
            "A standard, normal bank confirmation. You did not give away any passwords, card numbers, or OTPs.",
          psychologicalMechanism:
            "Normal conversation.",
          attackerNextMove:
            "The representative says thank you and ends the call.",
          regulatoryDirective:
            "Normal calls are safe as long as no passwords or OTPs are asked.",
        },
        {
          label: "No, I did not request that.",
          complianceType: "normal",
          shortBadge: "✅ Normal Correction",
          threatImpact: "0/100 Risk · Completely Safe",
          fullExplanation:
            "You tell the bank you didn't request the change. They cancel it without asking for any sensitive information.",
          psychologicalMechanism:
            "Standard business cancellation.",
          attackerNextMove:
            "The representative cancels the update and wishes you a nice day.",
          regulatoryDirective:
            "Real banks fix things without demanding secret codes.",
        },
      ],
    },
  },
};

export function getTurnExplanation(
  scenarioId: string,
  turnId: string,
  callerText: string,
  userReply?: string
): {
  questionTitle: string;
  attackVector: string;
  pretext: string;
  psychologicalHook: string;
  redFlags: string[];
  options: OptionExplanation[];
  matchedOption?: OptionExplanation;
  customExplanation?: {
    classification: "safe" | "suspicious" | "compromised" | "custom";
    fullExplanation: string;
    psychologicalMechanism: string;
    attackerNextMove: string;
    regulatoryDirective: string;
  };
} {
  const scen = SCENARIO_EXPLANATIONS[scenarioId] || SCENARIO_EXPLANATIONS["bank_kyc_otp_fraud"];
  const turnData = scen?.[turnId] || scen?.["turn_1"] || SCENARIO_EXPLANATIONS["bank_kyc_otp_fraud"]["turn_1"];

  let matchedOption: OptionExplanation | undefined;
  if (userReply) {
    matchedOption = turnData.options.find(
      (opt) =>
        opt.label.toLowerCase().trim() === userReply.toLowerCase().trim() ||
        userReply.toLowerCase().includes(opt.label.toLowerCase().slice(0, 20))
    );
  }

  // If user typed a custom reply
  let customExplanation: any = undefined;
  if (userReply && !matchedOption) {
    const lower = userReply.toLowerCase();
    const hasOtpDigits = /\b\d{4,8}\b/.test(userReply);
    const mentionsHangupOrReport = lower.includes("hang") || lower.includes("report") || lower.includes("1930") || lower.includes("police") || lower.includes("cyber") || lower.includes("card");
    const mentionsChallenge = lower.includes("who") || lower.includes("id") || lower.includes("branch") || lower.includes("proof") || lower.includes("why");

    if (hasOtpDigits || lower.includes("otp is") || lower.includes("code is")) {
      customExplanation = {
        classification: "compromised",
        fullExplanation:
          "DANGER: You typed secret numbers or an OTP. Scammers use bots to steal your money the second you say or type those numbers.",
        psychologicalMechanism: "Giving away your secret password.",
        attackerNextMove: "The scammer steals your money immediately.",
        regulatoryDirective: "Never speak, type, or share secret OTP digits with anyone.",
      };
    } else if (mentionsHangupOrReport) {
      customExplanation = {
        classification: "safe",
        fullExplanation:
          "GREAT JOB: You mentioned hanging up or calling the police/1930. That is the best defense because scammers run away when you refuse to talk.",
        psychologicalMechanism: "Taking control and ending the call.",
        attackerNextMove: "Scammer gives up and hangs up.",
        regulatoryDirective: "Always hang up on suspicious calls and call 1930 if needed.",
      };
    } else if (mentionsChallenge) {
      customExplanation = {
        classification: "suspicious",
        fullExplanation:
          "GOOD QUESTION: You asked who they are or what branch they are from. It slows them down, but scammers usually have fake answers ready. The best move is still to hang up.",
        psychologicalMechanism: "Testing the caller.",
        attackerNextMove: "Scammer will make up a fake name and push you harder.",
        regulatoryDirective: "Don't argue with strangers. Just hang up.",
      };
    } else {
      customExplanation = {
        classification: "custom",
        fullExplanation:
          "CUSTOM REPLY: VoiceShield analyzed your words. Remember the golden rule: never share your passwords, card details, or OTPs.",
        psychologicalMechanism: "Your custom answer.",
        attackerNextMove: "Caller will try to steer you back to giving them what they want.",
        regulatoryDirective: "Always verify calls by calling the bank back yourself.",
      };
    }
  }

  return {
    questionTitle: turnData.questionTitle,
    attackVector: turnData.attackVector,
    pretext: turnData.pretext,
    psychologicalHook: turnData.psychologicalHook,
    redFlags: turnData.redFlags,
    options: turnData.options || [],
    matchedOption,
    customExplanation,
  };
}
