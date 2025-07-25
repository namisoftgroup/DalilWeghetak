import { Link } from "react-router";

export default function ExperienceCard({ experience, city }) {
  return (
    <div className="experience-card">
      <img
        src={experience.image}
        alt={experience.title}
        className="card-image"
      />
      <div className="card-content">
        <h4 className="card-title">{experience.title}</h4>
        <div className="location-type">
          <i className="fa-solid fa-location-dot me-1"></i>
          {city?.name}
        </div>
        {/* <p className="card-text">{experience.subtitle}</p> */}
        <Link to={`/experiences/${experience.id}`} className="details-btn">
          عرض التفاصيل
        </Link>
      </div>
    </div>
  );
}
