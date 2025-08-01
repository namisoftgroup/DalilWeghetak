import { useEffect, useState } from "react";
import { Dropdown } from "react-bootstrap";
import { useTranslation } from "react-i18next";
import { ar, enUS } from "date-fns/locale";
import { format } from "date-fns";
import { DateRange } from "react-date-range";
import { useSearchParams } from "react-router";
import { useSelector } from "react-redux";
import InputField from "../../ui/forms/InputField";
import useGetCities from "../../hooks/home/useCities";
import useGetCategories from "../../hooks/home/useGetCategories";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";

export default function TopFilter() {
  const { t } = useTranslation();
  const { lang } = useSelector((state) => state.settings);
  const { data: cities = [] } = useGetCities();
  const { data: categories = [] } = useGetCategories();

  const [searchParams, setSearchParams] = useSearchParams();
  const [showDate, setShowDate] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [dateSelected, setDateSelected] = useState(false);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const [selectedCity, setSelectedCity] = useState("");
  const [selectedCategories, setSelectedCategories] = useState([]);

  useEffect(() => {
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const cityParam = searchParams.get("city");
    const categoriesParam = searchParams.get("categories");
    const search = searchParams.get("search");

    if (search) setSearchText(search);

    if (from && to) {
      setDateRange([
        {
          startDate: new Date(from),
          endDate: new Date(to),
          key: "selection",
        },
      ]);
      setDateSelected(true);
    }

    if (cityParam) {
      setSelectedCity(cityParam);
    }

    if (categoriesParam) {
      setSelectedCategories(categoriesParam.split("-"));
    }
  }, [searchParams]);

  const handleCategoryToggle = (id) => {
    setSelectedCategories((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const newParams = new URLSearchParams(searchParams.toString());

    if (dateSelected && dateRange[0].startDate && dateRange[0].endDate) {
      const startDate = format(dateRange[0].startDate, "yyyy-MM-dd");
      const endDate = format(dateRange[0].endDate, "yyyy-MM-dd");
      newParams.set("from", startDate);
      newParams.set("to", endDate);
    } else {
      newParams.delete("from");
      newParams.delete("to");
    }

    if (searchText) newParams.set("search", searchText);
    else newParams.delete("search");

    if (selectedCity) newParams.set("city", selectedCity);
    else newParams.delete("city");

    if (selectedCategories.length)
      newParams.set("categories", selectedCategories.join("-"));
    else newParams.delete("categories");

    setSearchParams(newParams);
  };

  return (
    <div className="top_filter">
      <div className="container">
        <form className="form" onSubmit={handleSubmit}>
          <InputField
            placeholder={t("search")}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />

          {/* Cities Dropdown */}
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-cities">
              {selectedCity
                ? `${t("places")}: ${
                    cities.find((c) => String(c.id) === selectedCity)?.name ||
                    ""
                  }`
                : t("places")}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{ padding: "10px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {cities.map((city) => (
                <label
                  htmlFor={`city-${city.id}`}
                  className="dropdown-item"
                  key={city.id}
                >
                  <input
                    type="radio"
                    name="city"
                    id={`city-${city.id}`}
                    checked={String(city.id) === selectedCity}
                    onChange={() => setSelectedCity(String(city.id))}
                  />
                  <span>{city.name}</span>
                </label>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Categories Dropdown (Multi) */}
          <Dropdown>
            <Dropdown.Toggle variant="success" id="dropdown-categories">
              {selectedCategories.length
                ? `${t("categories")}: ${selectedCategories
                    .map(
                      (id) =>
                        categories.find((cat) => String(cat.id) === id)?.name
                    )
                    .filter(Boolean)
                    .join(", ")}`
                : t("categories")}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{ padding: "10px" }}
              onClick={(e) => e.stopPropagation()}
            >
              {categories.map((category) => (
                <label
                  htmlFor={`cat-${category.id}`}
                  className="dropdown-item"
                  key={category.id}
                >
                  <input
                    type="checkbox"
                    name="category"
                    id={`cat-${category.id}`}
                    checked={selectedCategories.includes(String(category.id))}
                    onChange={() => handleCategoryToggle(String(category.id))}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </Dropdown.Menu>
          </Dropdown>

          {/* Dates Dropdown */}
          <Dropdown show={showDate} onToggle={() => setShowDate(!showDate)}>
            <Dropdown.Toggle variant="success" id="dropdown-dates">
              {t("dates")}:{" "}
              {dateSelected
                ? `${format(dateRange[0].startDate, "yyyy-MM-dd")} - ${format(
                    dateRange[0].endDate,
                    "yyyy-MM-dd"
                  )}`
                : t("select_date")}
            </Dropdown.Toggle>
            <Dropdown.Menu
              style={{ padding: "10px", width: "fit-content" }}
              onClick={(e) => e.stopPropagation()}
            >
              <div style={{ direction: lang === "ar" ? "rtl" : "ltr" }}>
                <DateRange
                  editableDateInputs={true}
                  onChange={(item) => {
                    setDateRange([item.selection]);
                    setDateSelected(true);
                  }}
                  moveRangeOnFirstSelection={false}
                  ranges={[dateRange[0]]}
                  locale={lang === "en" ? enUS : ar}
                />
              </div>
            </Dropdown.Menu>
          </Dropdown>

          <button type="submit" className="submit">
            <i className="fa-regular fa-magnifying-glass"></i>
          </button>
        </form>
      </div>
    </div>
  );
}
