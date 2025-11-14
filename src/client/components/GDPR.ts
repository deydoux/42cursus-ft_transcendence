import {BaseComponent} from './BaseComponent';
import {createElement} from '../utils/dom';

export class GDPR extends BaseComponent {
  render(): HTMLElement {
    const container = createElement('div', {
      className: 'gdpr',
    });

    container.innerHTML = `
      <h1 id="ft_transcendence-privacy-policy">ft_transcendence Privacy Policy</h1>
      
      <p>This privacy policy will explain how ft_transcendence uses the personal data we collect from you when you use our website.</p>
      
      <p><strong>Topics:</strong></p>
      
      <ul>
        <li>What data do we collect?</li>
        <li>How do we collect your data?</li>
        <li>How will we use your data?</li>
        <li>How do we store your data?</li>
        <li>What are your data protection rights?</li>
        <li>What are cookies?</li>
        <li>How do we use cookies?</li>
        <li>What types of cookies do we use?</li>
        <li>How to manage your cookies</li>
        <li>Privacy policies of other websites</li>
        <li>Changes to our privacy policy</li>
        <li>How to contact us</li>
        <li>How to contact the appropriate authorities</li>
      </ul>
     
      <h2 id="what-data-do-we-collect-">What data do we collect?</h2>
      
      <p>ft_transcendence collects the following data:</p>
      
      <ul>
        <li><strong>User information:</strong> Google OAuth ID (if used), username, last seen timestamp, password edition timestamp, 2FA (two-factor authentication) secret, 2FA status, avatar status, avatar (if uploaded).</li>
        <li><strong>Session information</strong>: Browser user agent, creation and update timestamps.</li>
        <li><strong>Social relationships (friends/blocks)</strong>: User IDs, relationship type, creation and update timestamps.</li>
        <li><strong>Messaging</strong>: Direct messages (content, sender/recipient IDs, timestamps, read status), general chat messages (content, timestamps).</li>
        <li><strong>Gameplay data</strong>: Matches (game type, mode, winner/loser IDs, scores, result, timestamps, ELO data and changes), ELO history (game type, value, timestamps), streaks (game type, mode, current and best streaks).</li>
      </ul>
      <h2 id="how-do-we-collect-your-data-">How do we collect your data?</h2>
      <p>You directly provide ft_transcendence with most of the data we collect. We collect data and process data when you:</p>
      <ul>
        <li>Register an account or log in.</li>
        <li>Update your profile.</li>
        <li>Send or receive messages.</li>
        <li>Play games and participate in rankings.</li>
      </ul>
      <h2 id="how-will-we-use-your-data-">How will we use your data?</h2>
      <p>ft_transcendence collects your data so that we can:</p>
      <ul>
        <li>Provide and operate our service.</li>
        <li>Secure our service and prevent abuse.</li>
        <li>Maintain and improve functionality and safety.</li>
        <li>Comply with legal obligations</li>
      </ul>
      <h2 id="how-do-we-store-your-data-">How do we store your data?</h2>
      <p>ft_transcendence securely stores your data on school computers at:</p>
      <p>
        42 Lyon Auvergne-Rhône-Alpes
        <br>
        78 route de Paris
        <br>
        69260 Charbonnières-les-Bains
        <br>
        France
      </p>
      <p>ft_transcendence will keep your personal data for two years after your last activity on the service. Once this time period has expired, we will delete your data by automated means.</p>
      <h2 id="what-are-your-data-protection-rights-">What are your data protection rights?</h2>
      <p>ft_transcendence would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
      <ul>
        <li><p><strong>The right to access</strong> - You have the right to request ft_transcendence for copies of your personal data.</p>
        </li>
        <li><p><strong>The right to rectification</strong> - You have the right to request that ft_transcendence correct any information you believe is inaccurate. You also have the right to complete information you believe is incomplete.</p>
        </li>
        <li><p><strong>The right to erasure</strong> - You have the right to request that ft_transcendence erase your personal data.</p>
        </li>
        <li><p><strong>The right to restrict processing</strong> - You have the right to request that ft_transcendence restrict the processing of your personal data, under certain conditions.</p>
        </li>
        <li><p><strong>The right to object to processing</strong> - You have the right to object to ft_transcendence&#39;s processing of your personal data, under certain conditions.</p>
        </li>
        <li><p><strong>The right to data portability</strong> - You have the right to request that ft_transcendence transfer the data that we have collected to another organization, or directly to you, under certain conditions.</p>
        </li>
      </ul>
      <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us at our email: <a href="mailto:deydoux@student.42lyon.fr">deydoux@student.42lyon.fr</a>, <a href="mailto:mapale@student.42lyon.fr">mapale@student.42lyon.fr</a> and <a href="mailto:quteriss@student.42lyon.fr">quteriss@student.42lyon.fr</a></p>
      <h2 id="what-are-cookies-">What are cookies?</h2>
      <p>Cookies are text files placed on your computer to collect standard internet log information and visitor behavior information. When you visit our website, we may collect information from you automatically through cookies or similar technology.</p>
      <p>For further information, visit allaboutcookies.org.</p>
      <h2 id="how-do-we-use-cookies-">How do we use cookies?</h2>
      <p>ft_transcendence uses cookies in a range of ways to improve your experience on our website, including:</p>
      <ul>
        <li>Keeping you signed in.</li>
      </ul>
      <h2 id="what-types-of-cookies-do-we-use-">What types of cookies do we use?</h2>
      <ul>
        <li><strong>Essential cookies</strong>: We use essential cookies to authenticate users and maintain security during your session</li>
      </ul>
      <h2 id="how-to-manage-your-cookies">How to manage your cookies</h2>
      <p>You can set your browser not to accept cookies, and the above website tells you how to remove cookies from your browser. However, in a few cases, some of our website features may not function as a result.</p>
      <h2 id="privacy-policies-of-other-websites">Privacy policies of other websites</h2>
      <p>The ft_transcendence website contains links to other websites. Our privacy policy applies only to our website, so if you click on a link to another website, you should read their privacy policy.</p>
      <h2 id="changes-to-our-privacy-policy">Changes to our privacy policy</h2>
      <p>ft_transcendence keeps its privacy policy under regular review and places any updates on this web page. This privacy policy was last updated on 21 October 2025.</p>
      <h2 id="how-to-contact-us">How to contact us</h2>
      <p>If you have any questions about ft_transcendence&#39;s privacy policy, the data we hold on you, or you would like to exercise one of your data protection rights, please do not hesitate to contact us.</p>
      <p>Email us at: deydoux@student.42lyon.fr mapale@student.42lyon.fr quteriss@student.42lyon.fr</p>
      <h2 id="how-to-contact-the-appropriate-authorities">How to contact the appropriate authorities</h2>
      <p>Should you wish to report a complaint or if you feel that ft_transcendence has not addressed your concern in a satisfactory manner, you may contact the data protection authority of your country.</p>
      <p>
        In France, this is the CNIL (Commission Nationale de l&#39;Informatique et des Libertés).
        <br>
        Website: <a href="https://cnil.fr/">https://cnil.fr/</a>
        <br>
        Phone: +33 (0) 1 53 73 22 22
        <br>
        Address:
      </p>
      <p>
        3 place de Fontenoy
        <br>
        TSA 80715
        <br>
        75334 Paris CEDEX 07
        <br>
        France
      </p>
  `;

    return container;
  }
}
