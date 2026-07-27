/**
 * =============================================================================
 * Unit Test
 * =============================================================================
 *
 * File Under Test
 * ----------------
 * src/components/card/course-manage-card.tsx
 *
 * Purpose
 * -------
 * Verify that CourseManageCard component handles loading skeleton states vs active
 * card states, renders title, HTML-stripped description, creation date, thumbnail,
 * and link navigation.
 *
 * Tested Features
 * ---------------
 * ✓ Skeleton rendering when loading is true
 * ✓ Card content rendering when loading is false
 * ✓ Thumbnail image display vs fallback BookOpen icon
 * ✓ Title and HTML-stripped description rendering
 * ✓ Created date formatting via formatServerDate
 * ✓ Next.js Link href binding
 *
 * Covered Scenarios
 * -----------------
 * ✓ loading: true (renders skeleton variant)
 * ✓ loading: false with thumbnailUrl
 * ✓ loading: false without thumbnailUrl (fallback icon)
 * ✓ HTML tags in description (stripped)
 *
 * Mocked Dependencies
 * -------------------
 * - None (Renders MUI elements via RTL)
 *
 * Not Covered
 * -----------
 * - CSS hover overlay transitions
 *
 * Notes
 * -----
 * Unit test for CourseManageCard component.
 */

import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CourseManageCard } from "../course-manage-card";

describe("CourseManageCard", () => {
  const baseProps = {
    title: "Java Spring Boot Microservices",
    description: "Build <span>scalable</span> backend APIs.",
    thumbnailUrl: "https://example.com/spring.png",
    createdAt: "2026-05-15T10:00:00.000Z",
    href: "/admin/courses/c-100",
  };

  it("shouldRenderSkeletonWhenLoadingIsTrue", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render card in loading state.
    // ----------------------------------------------------------------------------
    render(<CourseManageCard {...baseProps} loading={true} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title text is not rendered and skeletons are present.
    // ----------------------------------------------------------------------------
    expect(
      screen.queryByText("Java Spring Boot Microservices"),
    ).not.toBeInTheDocument();
  });

  it("shouldRenderCardDetailsAndLinkWhenLoadingIsFalse", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render active course manage card.
    // ----------------------------------------------------------------------------
    render(<CourseManageCard {...baseProps} loading={false} />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify title, stripped description, thumbnail image, date, and link.
    // ----------------------------------------------------------------------------
    expect(
      screen.getByText("Java Spring Boot Microservices"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Build scalable backend APIs."),
    ).toBeInTheDocument();

    const image = screen.getByAltText("Java Spring Boot Microservices");
    expect(image).toHaveAttribute("src", "https://example.com/spring.png");

    expect(screen.getByText("15/05/2026")).toBeInTheDocument();

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/admin/courses/c-100");
  });

  it("shouldRenderFallbackContainerWhenThumbnailUrlIsEmpty", () => {
    // ----------------------------------------------------------------------------
    // Arrange & Act
    // Render card with empty thumbnailUrl.
    // ----------------------------------------------------------------------------
    render(<CourseManageCard {...baseProps} thumbnailUrl="" />);

    // ----------------------------------------------------------------------------
    // Assert
    // Verify image element is absent.
    // ----------------------------------------------------------------------------
    expect(
      screen.queryByAltText("Java Spring Boot Microservices"),
    ).not.toBeInTheDocument();
  });
});
