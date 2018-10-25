BUILD_DIR=temp
CORE_LIB_DIR=lib
JOB_FILE="index.js"
JOB_ZIP_FILE="halo.zip"

# TODO: Add support for node_modules directory

# Create a temp directory to use
# for building the project
if [ -d $BUILD_DIR ]; then
  rm -r $BUILD_DIR/*
else
  mkdir $BUILD_DIR
fi

# Copy all library files into build directory
cp -R $CORE_LIB_DIR $BUILD_DIR

# Copy the job file into the build dir and rename
cp $JOB_FILE $BUILD_DIR

# Remove old zip file - if any
if [ -f "dist/$JOB_ZIP_FILE" ]; then
  rm "dist/$JOB_ZIP_FILE"
fi

# Go into the build dir and make the zip
cd $BUILD_DIR
zip --quiet -r $JOB_ZIP_FILE *
cd ..

# Copy the created zip file up into the root dir
cp "$BUILD_DIR/$JOB_ZIP_FILE" dist/

# Clean up
rm -rf $BUILD_DIR

echo "Built successfully :thumbs-up:"
