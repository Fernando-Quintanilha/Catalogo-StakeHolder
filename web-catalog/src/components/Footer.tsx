import { FaInstagram, FaMapMarkerAlt, FaEnvelope } from 'react-icons/fa';

export function Footer() {
    return (
        <footer className="bg-green-900 text-slate-400 py-10 mt-auto border-t">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">

                <div>
                    <h3 className="text-white font-bold text-xl mb-3">TH CHAVES</h3>
                    <p className="text-sm leading-relaxed">
                        Qualidade, preço justo e entrega rápida para sua obra.
                        Faça sua cotação online sem compromisso.
                    </p>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-3">Contato</h3>
                    <ul className="space-y-3 text-sm">

                        <li>
                            <a
                                href="https://share.google/E0jISmpYtLtqcrg1L"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                            >
                                <FaMapMarkerAlt className="text-lg" />
                                <span>Goiânia, GO</span>
                            </a>
                        </li>

                        <li>
                            <a
                                href="https://www.instagram.com/th_distribuidoraoficial/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 hover:text-pink-500 transition-colors"
                            >
                                <FaInstagram className="text-lg" />
                                <span>@thchaves</span>
                            </a>
                        </li>

                        <li className="flex items-center gap-2">
                            <FaEnvelope className="text-lg" />
                            <span>thChaves@gmail.com</span>
                        </li>
                    </ul>
                </div>

                <div>
                    <h3 className="text-white font-bold text-lg mb-3">Atendimento</h3>
                    <p className="text-sm">Seg - Sex: 08h às 18h</p>
                    <p className="text-sm">Sábado: 08h às 12h</p>
                </div>
            </div>

            <div className="text-center text-xs text-slate-300 mt-10 pt-6 border-t border-slate-800">
                &copy; {new Date().getFullYear()} TH Chaves. Desenvolvido com tecnologia própria.
            </div>
        </footer>
    );
}