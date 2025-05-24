import { GraduationCap, Users, Target, Award } from 'lucide-react';

const AboutUsPage = () => {
  const stats = [
    { icon: Users, value: '10,000+', label: 'Active Students' },
    { icon: GraduationCap, value: '500+', label: 'Courses' },
    { icon: Target, value: '95%', label: 'Success Rate' },
    { icon: Award, value: '50+', label: 'Expert Instructors' }
  ];

  const teamMembers = [
    {
      name: 'Piyush Bhardwaj',
      role: 'Founder & CEO',
      image: '/Piyush Image .jpg',
      bio: 'Education technology expert with 15+ years of experience in digital learning.'
    },
    {
      name: 'Michael Chen',
      role: 'Chief Technology Officer',
      image: 'https://randomuser.me/api/portraits/men/2.jpg',
      bio: 'Former tech lead at Google with expertise in educational platforms.'
    },
    {
      name: 'Dr. Emily Rodriguez',
      role: 'Head of Education',
      image: 'https://randomuser.me/api/portraits/women/3.jpg',
      bio: 'PhD in Education with a focus on innovative learning methodologies.'
    }
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      {/* Hero Section */}
      <section className="bg-base-200 py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              About SmartEdu
            </h1>
            <p className="text-lg text-base-content/70">
              Transforming education through technology and innovation. We're on a mission to make quality education accessible to everyone, everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <stat.icon className="w-8 h-8 text-primary" />
                </div>
                <div className="text-3xl font-bold mb-2">{stat.value}</div>
                <div className="text-base-content/70">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Our Mission</h2>
            <div className="space-y-6 text-base-content/70">
              <p>
                At SmartEdu, we believe that education should be accessible, engaging, and effective for everyone. Our platform combines cutting-edge technology with proven educational methodologies to create a learning experience that's both powerful and enjoyable.
              </p>
              <p>
                We're committed to breaking down barriers to education by providing high-quality courses, interactive learning tools, and personalized support to help students achieve their goals.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-12 text-center">Our Leadership Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <div key={index} className="bg-base-100 rounded-xl p-6 shadow-sm border border-base-300">
                <div className="flex flex-col items-center text-center">
                  <div className="w-32 h-32 rounded-full overflow-hidden mb-4">
                    <img src={member.image} alt={member.name} className="w-full h-full object-cover" />
                  </div>
                  <h3 className="text-xl font-bold mb-1">{member.name}</h3>
                  <div className="text-primary mb-3">{member.role}</div>
                  <p className="text-base-content/70">{member.bio}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-base-200">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Get in Touch</h2>
            <p className="text-base-content/70 mb-8">
              Have questions about our platform or want to learn more? We'd love to hear from you.
            </p>
            <div className="flex flex-col md:flex-row justify-center gap-4">
              <a href="mailto:piyushbhardwaj99@gmail.com" className="btn btn-primary">
                Contact Us
              </a>
              <a href="/signup" className="btn btn-outline">
                Join Our Platform
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutUsPage; 