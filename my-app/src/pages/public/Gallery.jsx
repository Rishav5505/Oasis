import React from 'react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

// Coaching Photos for Gallery
import coaching1 from '../../assets/474589765_1276841513370808_7764133733018340516_n.jpg';
import coaching2 from '../../assets/474709499_1278016816586611_5145336952645222805_n.jpg';
import coaching3 from '../../assets/475415780_1285121682542791_8365407221338603766_n.jpg';
import coaching4 from '../../assets/475650196_1285121685876124_4721209917245273032_n.jpg';
import coaching5 from '../../assets/475679772_1285121712542788_7912544254822272362_n.jpg';
import coaching6 from '../../assets/475774089_1285121659209460_7756818827304219133_n.jpg';
import coaching7 from '../../assets/475874688_1285121709209455_8696569436817650851_n.jpg';
import coaching8 from '../../assets/475970746_1284020299319596_786940650357844988_n.jpg';
import coaching9 from '../../assets/476155997_1285121702542789_8367462175423701049_n.jpg';
import coaching10 from '../../assets/476640718_1290058428715783_719137760532989198_n.jpg';
import coaching11 from '../../assets/476644184_1290058588715767_7843985879107140710_n.jpg';
import coaching12 from '../../assets/552586383_1326566728853861_1335730407087314294_n.jpg';
import best1 from '../../assets/best.jpg';
import best2 from '../../assets/best 2.jpg';
import best3 from '../../assets/best 3.jpg';

const Gallery = () => {
    const images = [
        { img: coaching1, title: "Scholarship Distribution Ceremony", category: "Events" },
        { img: coaching2, title: "Interactive Classroom Session", category: "Academic" },
        { img: best1, title: "Top Rankers Celebration", category: "Results" },
        { img: coaching3, title: "Expert Doubt Solving", category: "Academic" },
        { img: coaching4, title: "Academic Excellence Awards", category: "Events" },
        { img: coaching5, title: "Concept Building Workshop", category: "Academic" },
        { img: best2, title: "Wall of Fame", category: "Results" },
        { img: coaching6, title: "Student Mentorship Program", category: "Mentorship" },
        { img: coaching7, title: "Intensive Exam Drill", category: "Academic" },
        { img: coaching8, title: "Peer Learning Group", category: "Mentorship" },
        { img: best3, title: "Successful Batch 2024", category: "Results" },
        { img: coaching9, title: "Modern Campus Life", category: "Facility" },
        { img: coaching10, title: "Annual Prize Distribution", category: "Events" },
        { img: coaching11, title: "Achievement Gala", category: "Events" },
        { img: coaching12, title: "Dream High Session", category: "Mentorship" },
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <section className="relative py-24 bg-indigo-900 overflow-hidden">
                <div className="absolute inset-0 opacity-20">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2"></div>
                    <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500 rounded-full blur-[120px] translate-y-1/2 -translate-x-1/2"></div>
                </div>
                <div className="container mx-auto px-6 relative z-10 text-center">
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6">Experience <span className="text-indigo-400">Oasis</span></h1>
                    <p className="text-xl text-gray-300 max-w-2xl mx-auto">Capturing the journey of excellence, hard work, and celebration at Oasis JEE Classes.</p>
                </div>
            </section>

            {/* Gallery Grid */}
            <section className="py-20 flex-grow">
                <div className="container mx-auto px-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
                        {images.map((item, index) => (
                            <div key={index} className="group relative overflow-hidden rounded-3xl shadow-xl aspect-[4/3] cursor-pointer border border-gray-100 bg-white">
                                <img
                                    src={item.img}
                                    alt={item.title}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-8">
                                    <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                                        <span className="inline-block bg-indigo-600/30 backdrop-blur-md border border-white/20 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full mb-3">
                                            {item.category}
                                        </span>
                                        <h3 className="text-white text-xl md:text-2xl font-bold leading-tight">
                                            {item.title}
                                        </h3>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    );
};

export default Gallery;
