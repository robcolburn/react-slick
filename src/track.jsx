'use strict';

import React from 'react';
import classnames from 'classnames';

var getSlideClasses = (spec, index, baseClass) => {
  var slickActive, slickCenter, slickCloned;
  var centerOffset;

  if (spec.rtl) {
    index = spec.slideCount - 1 - index;
  }

  slickCloned = (index < 0) || (index >= spec.slideCount);
  if (spec.centerMode) {
    centerOffset = Math.floor(spec.slidesToShow / 2);
    slickCenter = (index - spec.currentSlide) % spec.slideCount === 0;
    if ((index > spec.currentSlide - centerOffset - 1) && (index <= spec.currentSlide + centerOffset)) {
      slickActive = true;
    }
  } else {
    slickActive = (spec.currentSlide <= index) && (index < spec.currentSlide + spec.slidesToShow);
  }
  return classnames({
    'slick-slide': true,
    'slick-active': slickActive,
    'slick-center': slickCenter,
    'slick-cloned': slickCloned
  }, baseClass);
};

var getSlideStyle = function (spec, index, baseStyle) {
  var style = {};

  if (spec.variableWidth === undefined || spec.variableWidth === false) {
    style.width = spec.slideWidth;
  }

  if (spec.fade) {
    style.position = 'relative';
    style.left = -index * spec.slideWidth;
    style.opacity = (spec.currentSlide === index) ? 1 : 0;
    style.transition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
    style.WebkitTransition = 'opacity ' + spec.speed + 'ms ' + spec.cssEase;
  }

  return {...baseStyle, ...style};
};

var renderSlides = (spec) => {
  // Transform Children into 3 flat array: cloned slides at beginning, original slides, cloned slides at end
  let children = React.Children.toArray(this.props.children)
    // Attach original index to each child, we'll need this later.
    .map((child, index) => React.cloneElement(child, {'data-original-index': index}));
  const slides = children;
  let slidesToShow = this.props.slidesToShow;

  // Create a new array, with [cloned slides at beginning, original slides, cloned slides at end]
  if (spec.infinite && spec.fade === false) {
    // variableWidth doesn't wrap properly
    slidesToShow = slidesToShow + (spec.variableWidth ? 1 : 0);
    const preCloneSlides = slides.slice(slides.length - slidesToShow, slides.length);
    const postCloneSlides = slides.slice(0, slidesToShow);
    children = preCloneSlides.concat(slides, postCloneSlides);
  }

  // Determine classes and inline-styles for slides.
  children = children.map((child, index) => {
    const originalIndex = child.props['data-original-index'];
    // Shift the index by the amount padding to the front
    const positionIndex = index - (slides.length - slidesToShow);
    const base = spec.lazyLoad && spec.lazyLoadedList.indexOf(originalIndex) ? <div/> : child;
    React.cloneElement(base, {
      key: positionIndex,
      'data-index': positionIndex,
      'data-original-index': originalIndex,
      className: getSlideClasses(spec, index, child.props.className),
      style: getSlideStyle(spec, originalIndex, child.props.style)
    });
  });

  // Revere Children for right-to-left mode.
  if (spec.rtl) {
    children = children.reverse();
  }

  return children;
};

export var Track = React.createClass({
  render: function () {
    var slides = renderSlides(this.props);
    return (
      <div className='slick-track' style={this.props.trackStyle}>
        { slides }
      </div>
    );
  }
});
